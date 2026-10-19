import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

/**
 * 编译期图标解析插件
 * ─────────────────────────────────────────────────────────────
 * `apps.json` 是「源数据」，只读不写。这个插件在构建/开发启动时：
 *
 *   1. 读取 apps.json，拿到每个条目的 url
 *   2. 抓取该页面的 HTML，按优先级找出它自己声明的图标：
 *        <link rel="apple-touch-icon"> > <link rel="icon"> > /favicon.ico
 *   3. 把图标下载到内存，用内容哈希做文件名（同图同文件，天然去重）
 *   4. 通过虚拟模块 `virtual:app-icons` 把 { id: dataURI } 交给应用代码
 *
 * 这一步不做任何网络请求失败就报错的处理：
 * 站点不可达、没有图标、图标不是常见图片格式 —— 一律跳过，
 * 由 UI 侧降级为 apps.json 里的 emoji。
 *
 * 缓存落在 node_modules/.cache/app-icons/，避免每次冷启动都重新抓一遍。
 */

const VIRTUAL_ID = 'virtual:app-icons'
const RESOLVED_ID = '\0' + VIRTUAL_ID

const CACHE_DIR = path.resolve('node_modules/.cache/app-icons')

/** 常见图片扩展名 → MIME。按 content-type 判断更准，这里是兜底 */
const EXT_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif'
}

/**
 * 内联进 JS 的体积上限，故意设得很小。
 * 图标是「可以长期缓存、不该阻塞首屏脚本」的资源：
 * 之前设 12KB 时，两张 8–12KB 的 apple-touch-icon 被塞进主 chunk，
 * JS 从 9KB 涨到 35KB，gzip 后也翻了几倍，这是不划算的。
 * 现在只有极小的内联 SVG 才进 JS，其余走 Vite 资源管线（带内容 hash、可缓存）。
 */
const MAX_INLINE_BYTES = 2 * 1024

const FETCH_TIMEOUT = 8000

function hash(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12)
}

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        // 有些站点对无 UA 的请求返回 403
        'user-agent': 'Mozilla/5.0 (compatible; LollipopHomeBot/1.0)',
        ...(opts.headers || {})
      }
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 从 HTML 里挑一个最像「应用图标」的声明。
 * apple-touch-icon 通常是 180×180 的实心方图，比 favicon 更适合卡片。
 */
function pickIconHref(html, pageUrl) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0])

  /**
   * 取值必须按「同种引号」配对。
   * data URI 内部通常含单引号（如 xmlns='...'），
   * 若用 [^"']+ 那么匹配到第一个单引号就断了，得到被截断的地址。
   */
  const attr = (tag, name) => {
    const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
    return m ? (m[1] ?? m[2]) : undefined
  }

  const parse = (tag) => ({
    rel: (attr(tag, 'rel') || '').toLowerCase(),
    href: attr(tag, 'href'),
    type: attr(tag, 'type') || ''
  })

  const all = links.map(parse).filter((l) => l.href)

  const byRel = (predicate) => all.find((l) => predicate(l.rel.split(/\s+/)))

  // 1) apple-touch-icon（排除 precomposed 之外的变体不区分，都可用）
  const apple = byRel((rels) => rels.includes('apple-touch-icon') || rels.includes('apple-touch-icon-precomposed'))
  // 2) rel="icon"，优先 svg/png，跳过 data URI（站点内嵌的也能用，但优先真实文件）
  const icons = all.filter((l) => l.rel.split(/\s+/).includes('icon'))
  const realFile = icons.find((l) => !l.href.startsWith('data:'))
  // 3) 站点自己声明的 data URI（如 ConstellationDaily），可直接用，无需下载
  const dataUri = icons.find((l) => l.href.startsWith('data:'))

  const chosen = apple || realFile || dataUri
  if (!chosen) return null

  try {
    return { href: new URL(chosen.href, pageUrl).href, declaredType: chosen.type }
  } catch {
    return null
  }
}

/**
 * 下载图标并转成对应用法：
 *   小图 → data URI 内联进 JS
 *   大图 → 写入 cache 目录，返回可由 Vite 处理的资源路径
 * 任何异常返回 null，交给 emoji 降级。
 */
async function materialize(href, declaredType, log) {
  // 站点直接内嵌的 data URI：原样返回
  if (href.startsWith('data:')) return { kind: 'dataUri', value: href }

  let res
  try {
    res = await fetchWithTimeout(href)
  } catch (err) {
    log(`   ✗ 下载失败 ${href} (${err.name})`)
    return null
  }
  if (!res.ok) {
    log(`   ✗ 下载失败 ${href} (HTTP ${res.status})`)
    return null
  }

  const buf = Buffer.from(await res.arrayBuffer())
  if (!buf.length) {
    log(`   ✗ 空文件 ${href}`)
    return null
  }

  const contentType = (res.headers.get('content-type') || declaredType || '').split(';')[0].trim()
  const ext = Object.keys(EXT_MIME).find((e) => href.toLowerCase().split('?')[0].endsWith(e)) || '.png'
  const mime = contentType.startsWith('image/') ? contentType : EXT_MIME[ext]

  if (!mime || !mime.startsWith('image/')) {
    log(`   ✗ 不是图片 ${href} (${contentType || 'unknown'})`)
    return null
  }

  // 小图内联，省一次请求
  if (buf.length <= MAX_INLINE_BYTES) {
    return { kind: 'dataUri', value: `data:${mime};base64,${buf.toString('base64')}` }
  }

  // 大图落盘到缓存目录，交给 Vite 作为静态资源产出
  const name = `${hash(buf)}${ext}`
  const file = path.join(CACHE_DIR, name)
  try {
    await fs.access(file)
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    await fs.writeFile(file, buf)
  }
  log(`   ↓ 落盘 ${name} (${(buf.length / 1024).toFixed(1)} KB)`)
  return { kind: 'file', value: file }
}

async function resolveAll(apps, log) {
  const out = {}
  const entries = Object.entries(apps).filter(([, v]) => v?.url)

  await Promise.all(
    entries.map(async ([id, app]) => {
      log(` - ${id}`)
      try {
        const res = await fetchWithTimeout(app.url)
        if (!res.ok) {
          log(`   ✗ 页面不可达 (HTTP ${res.status})，降级 emoji`)
          return
        }
        const html = await res.text()
        const picked = pickIconHref(html, res.url || app.url)
        if (!picked) {
          log(`   ✗ 页面未声明任何图标，降级 emoji`)
          return
        }
        const icon = await materialize(picked.href, picked.declaredType, log)
        if (!icon) return
        out[id] = icon
        log(`   ✓ ${picked.href.slice(0, 96)}`)
      } catch (err) {
        log(`   ✗ 解析异常 ${err.message}，降级 emoji`)
      }
    })
  )

  return out
}

/** 生成虚拟模块源码。file 类型交给 Vite 的 import 处理，打包后是带 hash 的资源 */
function generateCode(icons) {
  const imports = []
  const map = []

  for (const [id, icon] of Object.entries(icons)) {
    if (icon.kind === 'dataUri') {
      map.push([id, JSON.stringify(icon.value)])
    } else {
      const varName = `__icon_${id.replace(/[^a-zA-Z0-9_$]/g, '_')}`
      imports.push(`import ${varName} from ${JSON.stringify(icon.value)}`)
      map.push([id, varName])
    }
  }

  const body = map.map(([id, val]) => `  ${JSON.stringify(id)}: ${val}`).join(',\n')

  return `${imports.join('\n')}${imports.length ? '\n' : ''}
export default {
${body}
}
`
}

export function appIcons({ offline = false } = {}) {
  let cache = null

  return {
    name: 'lollipop:app-icons',

    async buildStart() {
      // 只在真正需要时抓取；offline 用于纯离线构建（CI 无网时也能出包）
      if (cache && !this._forceReload) return

      let apps
      try {
        const raw = await fs.readFile(path.resolve('apps.json'), 'utf8')
        apps = JSON.parse(raw)
      } catch {
        cache = {}
        return
      }

      if (offline) {
        cache = {}
        return
      }

      this.info?.('[app-icons] 解析站点图标中…')
      const log = (msg) => this.info?.(`[app-icons]${msg}`)
      cache = await resolveAll(apps, log)
      this.info?.(
        `[app-icons] 完成：${Object.keys(cache).length}/${Object.keys(apps).length} 个站点取到图标`
      )
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },

    load(id) {
      if (id !== RESOLVED_ID) return null
      return generateCode(cache || {})
    }
  }
}
