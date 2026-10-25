import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * 公开数据接口插件
 * ─────────────────────────────────────────────────────────────
 * 站点是纯静态的（GitHub Pages），没有服务端，因此「接口」= 一个
 * 在构建阶段由 apps.json 生成的静态 JSON 文件：
 *
 *   构建时 → dist/api/apps.json（随产物一起部署）
 *   开发时 → dev server 中间件，实时读取 apps.json 返回
 *
 * apps.json 仍只读不写，接口输出的是它的规整视图：
 * 过滤掉没有 url 的无效条目，补齐 name 默认值与 emoji 空值。
 *
 * UI 侧不引用、不展示这个接口，它的用途是给外部调用方取数。
 */

const DEFAULTS = {
  /** 源数据（相对项目根目录） */
  entry: 'apps.json',
  /** 产物内的输出路径，最终对外地址为 `${base}api/apps.json` */
  outputFile: 'api/apps.json',
  /** 开发服务器上的访问路径 */
  route: '/api/apps.json'
}

/**
 * 把 apps.json 的「id → 元数据」映射转成稳定的对外结构。
 * 只暴露 name / url / emoji 三个已有字段，不引入任何新语义。
 */
function buildPayload(raw) {
  const apps = Object.entries(raw)
    .filter(([, app]) => app && typeof app.url === 'string' && app.url)
    .map(([id, app]) => ({
      id,
      name: app.name || id,
      url: app.url,
      emoji: app.emoji || null
    }))

  return { count: apps.length, apps }
}

async function readPayload(entry) {
  const raw = await fs.readFile(path.resolve(entry), 'utf8')
  return buildPayload(JSON.parse(raw))
}

export function appsApi(options = {}) {
  const { entry, outputFile, route } = { ...DEFAULTS, ...options }
  let cached = null

  return {
    name: 'lollipop:apps-api',

    async buildStart() {
      try {
        cached = await readPayload(entry)
      } catch (err) {
        this.warn?.(`[apps-api] 无法生成接口数据：${err.message}`)
        cached = null
      }
    },

    // 构建：把接口数据作为静态资源写入 dist
    generateBundle() {
      if (!cached) return
      this.emitFile({
        type: 'asset',
        fileName: outputFile,
        source: JSON.stringify(cached, null, 2) + '\n'
      })
      this.info?.(`[apps-api] 已输出 ${outputFile}（${cached.count} 条）`)
    },

    // 开发：中间件按请求实时读取，改 apps.json 后刷新即生效
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        if (pathname !== route) return next()

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET, HEAD')
          res.end()
          return
        }

        try {
          const payload = await readPayload(entry)
          const body = JSON.stringify(payload, null, 2) + '\n'
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(req.method === 'HEAD' ? undefined : body)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: `apps.json 读取或解析失败：${err.message}` }))
        }
      })
    }
  }
}
