import { computed, ref } from 'vue'

// 通过 Vite alias 直接 import 根目录的 apps.json
// 加项目只改这一个文件，不需要碰任何代码
// @ts-ignore - vite alias
import rawApps from '@apps'
// 编译期插件产出：站点自己声明的图标（data URI 或已处理过的资源 URL）
// 抓不到图标的站点不会出现在这个对象里
// @ts-ignore - 虚拟模块
import resolvedIcons from 'virtual:app-icons'

/**
 * apps.json 是纯元数据，只认 3 个字段：
 *   name   必填  显示的名称
 *   url    必填  点击后打开的地址
 *   emoji  可选  站点取不到 favicon 时的降级图标
 *
 * 图标来源的优先级：
 *   1. 编译期从站点 HTML 抓到的真实图标（virtual:app-icons）
 *   2. apps.json 里的 emoji
 *   3. 名称首字
 *
 * 这样新增一个站点只需要写 name + url，图标由构建阶段自己去找；
 * 源数据永远不会被构建流程改写。
 */
function normalize(id, raw) {
  const icon = resolvedIcons[id] || null

  if (import.meta.env.DEV && !icon && !raw.emoji) {
    console.warn(
      `[apps.json] "${id}" 未取到站点图标，且没有 emoji 字段，将回退为名称首字。`
    )
  }

  return {
    id,
    name: raw.name || id,
    url: raw.url,
    icon,
    emoji: raw.emoji || null
  }
}

const apps = ref(
  Object.entries(rawApps)
    .map(([id, raw]) => normalize(id, raw))
    .filter((a) => Boolean(a.url))
)

export function useApps() {
  const count = computed(() => apps.value.length)
  return { apps, count }
}
