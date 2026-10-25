# 🍭 Lollipop Home

> 一个优雅、极简、动效细腻的 **GitHub 项目门户**，把我的小工具们集中展示在一处。

基于 **Vue 3 + Vite** 打造，无第三方 UI 库，CSS 完全手写。

![tech](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![tech](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![tech](https://img.shields.io/badge/%E9%83%A8%E7%BD%B2-GitHub%20Pages-222?logo=github)

---

## ✨ 特色

- **🃏 一叠扑克牌** —— 纵向堆叠，后一张压住前一张，只露出左上角；每张牌独立色相与纹样
- **🎴 抽牌交互** —— 横版悬停时整张牌向左抽出，填满预留车道，纵向不动、不遮挡任何兄弟牌
- **📱 横竖自适应** —— 宽屏 16:9 横卡，竖屏 9:16 竖卡并静止叠放
- **🔍 图标自动获取** —— 编译期抓取各站点自己声明的 favicon，新增项目零配置
- **🔌 只读数据接口** —— 由 `apps.json` 自动生成 `/api/apps.json`，供外部调用方取数，页面本身不展示接口信息
- **🌗 双主题** —— 跟随系统 + 手动切换，胶囊滑块，记忆到 localStorage
- **♿ 可访问性** —— 遵循 `prefers-reduced-motion`、`hover:hover` 媒体查询

---

## 🧠 设计理念

| 模块 | 关键点 |
| --- | --- |
| 背景 | 浮动光斑 + 鼠标驱动视差 + 径向渐变氛围光 |
| 导航 | 滚动 24px 后玻璃化；胶囊主题切换 |
| 牌堆 | 纵向一叠，像牌包里码好的牌；后一张压住前一张，只露出左上角那一条信息 |
| 色相与纹样 | 由 `index` 顺序命中：颜色取 `HUES[index % 12]`，纹样取 `MOTIFS[index % 12]` |
| 卡片布局 | 左上角 favicon + 名称（叠放时唯一必须看清的部分）、居中大纹样（可被压住）、右缘竖排地址（防伪码式装饰） |
| 抽牌 | **仅横版**：悬停 / 键盘聚焦时整张牌向左抽出；纵向不动、层级不变，绝不遮挡兄弟牌 |
| 响应式 | 宽屏 16:9 横卡（卡宽占容器 5/6，左留 1/6 作抽出车道）；竖屏 9:16 竖卡，静止叠放不做悬浮弹动 |
| 最小尺寸 | 卡牌设最小可读宽度，视口过窄时宁可让卡片部分出屏，由 `overflow-x: clip` 裁切但不产生横向滚动 |
| 跳转 | 卡片即链接，在当前页签直接打开对应项目 |

所有过渡时序统一收敛在 `--dur-fast/base/slow/glacial` 四个时长令牌中，方便微调"全局节奏"。

---

## 🗂 目录结构

```
LollipopHome/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ AppCard.vue          # 单张卡片（角落信息 / 中央纹样 / 竖排地址）
│  │  ├─ AppGrid.vue          # 纵向牌堆容器（层级与响应式宽度）
│  │  ├─ BackgroundFX.vue     # 背景光斑 / 视差
│  │  └─ NavBar.vue
│  ├─ composables/
│  │  ├─ useApps.js           # 元数据 + 编译期图标合并
│  │  ├─ useMouse.js          # 归一化鼠标坐标
│  │  └─ useTheme.js          # 主题状态（localStorage）
│  ├─ App.vue
│  ├─ main.js
│  └─ styles.css              # 设计令牌 + 全局样式
├─ vite-plugins/
│  ├─ app-icons.js            # 编译期抓取站点 favicon（只读 apps.json）
│  └─ apps-api.js             # 由 apps.json 生成只读数据接口
├─ apps.json                  # 项目清单
├─ index.html
├─ vite.config.js
└─ package.json
```

---

## 🔌 数据接口

站点是纯静态托管（GitHub Pages），没有服务端。这里的「接口」是构建阶段由 `apps.json` 生成的一份静态 JSON 文件，随构建产物一并发布，因此无需任何服务端进程。页面本身不引用、也不展示这个接口。

### 请求

```
GET https://looly.top/api/apps.json
```

| 项 | 说明 |
| --- | --- |
| 方法 | `GET`（`HEAD` 也可用，只返回响应头） |
| 参数 | 无 |
| 鉴权 | 无，公开只读 |
| 响应类型 | `application/json; charset=utf-8` |
| 跨域 | 允许任意来源（GitHub Pages 对静态资源返回 `Access-Control-Allow-Origin: *`），可直接在浏览器前端 `fetch` |

本地开发时同一路径由 dev server 提供：`http://localhost:5173/api/apps.json`。
部署在子路径时（`LOLLIPOP_BASE=/repo/`），地址相应变为 `/repo/api/apps.json`。
构建产物中的文件位置固定为 `dist/api/apps.json`。

### 响应

```json
{
  "count": 2,
  "apps": [
    {
      "id": "WhatToEat",
      "name": "今天吃点啥",
      "url": "https://looly.top/WhatToEat/",
      "emoji": "🍱"
    },
    {
      "id": "ConstellationDaily",
      "name": "每日星座",
      "url": "https://looly.top/ConstellationDaily/",
      "emoji": "✨"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `count` | number | `apps` 的条目数 |
| `apps` | array | 应用列表，顺序与 `apps.json` 中的书写顺序一致 |
| `apps[].id` | string | 应用标识，即 `apps.json` 中的键名 |
| `apps[].name` | string | 显示名称；源数据未提供时回退为 `id` |
| `apps[].url` | string | 应用入口地址，绝对 URL |
| `apps[].emoji` | string \| null | 图标降级用的字符；源数据未提供时为 `null` |

说明：

- 源数据中缺少 `url` 的条目会被过滤，不会出现在接口结果里。
- 接口只输出 `apps.json` 已有的三个字段，不返回站点图标：图标是构建期从各站点抓取的结果，可能随时失败并降级为 `emoji`，不适合作为接口契约。
- 更新时机：修改 `apps.json` 后重新构建并部署，接口内容随之更新；接口没有独立的数据副本，始终与 `apps.json` 同源。

---

## 📄 License

[MIT](LICENSE) © Lollipop
