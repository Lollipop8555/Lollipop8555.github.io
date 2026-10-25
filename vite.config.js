import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { appIcons } from './vite-plugins/app-icons.js'
import { appsApi } from './vite-plugins/apps-api.js'

/**
 * 资源基路径。
 *
 * 部署在域名根路径时保持 '/'；部署在子路径时用环境变量覆盖：
 *   LOLLIPOP_BASE=/sub-path/ npm run build
 * 也可以直接改下面的 defaultBase。
 */
const defaultBase = '/'

export default defineConfig(({ command }) => {
  const resolvedBase = process.env.LOLLIPOP_BASE || defaultBase
  return {
    base: command === 'build' ? resolvedBase : '/',
    plugins: [
      vue(),
      // 编译期抓取各站点自己的 favicon，结果以虚拟模块注入；
      // apps.json 保持纯元数据，任何情况下都不回写。
      appIcons({ offline: process.env.LOLLIPOP_OFFLINE === '1' }),
      // 由 apps.json 生成静态数据接口：构建期写入 dist/api/apps.json，
      // 开发期由 dev server 直接返回。UI 不展示也不引用该接口。
      appsApi()
    ],
    // 让 src/ 可以直接 import 根目录的 apps.json（用户配置数据源）
    resolve: {
      alias: {
        '@apps': fileURLToPath(new URL('./apps.json', import.meta.url))
      }
    },
    server: {
      host: true,
      port: 5173
    },
    build: {
      target: 'es2019',
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue']
          }
        }
      }
    }
  }
})