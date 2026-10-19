# 🍭 Lollipop Home

> 一个优雅、极简、动效细腻的 **GitHub 项目门户**，把我的小工具们集中展示在一处。

基于 **Vue 3 + Vite** 打造，无第三方 UI 库，CSS 完全手写，体积轻量，适合托管在 GitHub Pages。

![tech](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![tech](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![tech](https://img.shields.io/badge/部署-GitHub%20Pages-222?logo=github)

---

## ✨ 特色

- **🎨 时髦简约** —— 暗色为主、玻璃拟态、紫蓝粉橙渐变光晕
- **🎬 细腻动效** —— 鼠标视差、3D 卡片倾斜、滚动渐显、弹簧过渡、Loading 三层旋转
- **📱 响应式** —— 桌面、平板、手机三端体验精心打磨（移动端汉堡菜单）
- **🌗 双主题** —— 跟随系统 + 手动切换，胶囊滑块，记忆到 localStorage
- **⚡ 极致轻量** —— 生产包 gzip 后约 **43KB**（含 Vue 运行时）
- **🧩 数据驱动** —— 在 `src/data/apps.json` 加一行即可上线新项目
- **♿ 可访问性** —— 遵循 `prefers-reduced-motion`、`hover:hover` 媒体查询

---

## 🚀 本地开发

```bash
# Node ≥ 18
npm install
npm run dev      # 启动开发服务器，默认 http://localhost:5173
npm run build    # 生产构建，产物输出到 dist/
npm run preview  # 本地预览生产包
```

## 📦 添加 / 修改项目

**只用改根目录的 `apps.json`，不需要碰任何代码。**

```jsonc
{
  "MyNewApp": {
    "name": "我的新项目",                              // 必填
    "url": "https://lollipop8555.github.io/MyNewApp/", // 必填
    "emoji": "🚀"                                     // 可选：站点取不到图标时的降级
  }
}
```

**只需要 `name` + `url`。图标不用你填。**

`apps.json` 是纯元数据，构建流程**只读不写**。图标由编译期插件自动获取：

1. 抓取该 `url` 的 HTML
2. 按优先级找站点自己声明的图标：`apple-touch-icon` → `rel="icon"` → 内嵌 data URI
3. 下载并处理：小 SVG 内联进 JS，较大图片走 Vite 资源管线（带内容 hash、可长期缓存）
4. 抓不到就依次降级：`emoji` → 名称首字

实测 6 个站点里 4 个能自动取到图标，PhotoCurve 与 PopRPG 页面确实没声明任何图标，自动落到 emoji（🌀 / 🎮）。新增站点同样零配置，构建日志会打印每个站点的解析结果：

```
[app-icons] - MyNewApp
[app-icons]   ✓ https://.../apple-touch-icon.png
[app-icons] 完成：7/7 个站点取到图标
```

卡片的色相与纹样也由条目顺序自动轮转（`HUES[index % 12]`、`MOTIFS[index % 12]`），同样不需要手工配置。

离线构建（如 CI 无外网）可设 `LOLLIPOP_OFFLINE=1`，此时直接跳过图标抓取、全部走 `emoji` 降级，不会因网络失败而中断构建。

**工作流：**
1. 改 `apps.json`
2. `git add . && git commit -m "feat: 新增 MyNewApp" && git push`
3. GitHub Actions 自动构建并部署 🚀

---

## 🌐 部署到 GitHub Pages

### 方案 A：用户主页（推荐 —— 部署为 `lollipop8555.github.io`）

1. 在 GitHub 上创建仓库 **`Lollipop8555.github.io`**（仓库名必须严格一致）
2. 把本项目推送到 `main` 分支
3. 进入仓库 **Settings → Pages**：
   - **Source** 选 `GitHub Actions`
4. 在项目中创建 `.github/workflows/deploy.yml`（见下方示例）
5. 推送到 `main` 后 Actions 会自动构建并发布
6. 之后访问 `https://lollipop8555.github.io/` 即可看到 🎉

### 方案 B：项目主页（部署为 `lollipop8555.github.io/<repo-name>`）

1. 创建任意名称的仓库（如 `home`、`portal`）
2. 部署前构建时设置 base 路径：
   ```bash
   LOLLIPOP_BASE=/home/ npm run build
   ```
3. 用 GitHub Actions 把 `dist/` 发布到 `gh-pages` 分支

### 工作流文件示例（推荐 Actions 方式）

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          # 部署为项目页时改成 /<repo-name>/，用户页留空
          LOLLIPOP_BASE: ${{ vars.LOLLIPOP_BASE || '' }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> 把 `vars.LOLLIPOP_BASE` 配到仓库 **Settings → Variables** 里，就能灵活切换用户页 / 项目页。

---

## 🧠 设计理念

| 模块 | 关键点 |
| --- | --- |
| 背景 | 浮动光斑 + 鼠标驱动视差 + 径向渐变氛围光 |
| 导航 | 滚动 24px 后玻璃化；胶囊主题切换 |
| 牌堆 | 纵向一叠卡片，像牌包里码好的牌；后一张压住前一张，只露出左上角那一条信息 |
| 色相与纹样 | 全部由 `index` 顺序命中：颜色取 `HUES[index % 12]`，纹样取 `MOTIFS[index % 12]`，新增项目零配置 |
| 卡片布局 | 左上角 favicon + 名称（叠放时唯一必须看清的部分）、居中大纹样（可被压住）、右缘竖排地址（防伪码式装饰） |
| 抽牌 | **仅横版**：悬停 / 键盘聚焦时整张牌向左抽出，填满左侧预留空档；纵向不动、层级不变，绝不遮挡兄弟牌 |
| 响应式 | 宽屏 16:9 横卡（卡宽占容器 5/6，左留 1/6 作抽出车道）；竖屏 9:16 竖卡，静止叠放不做悬浮弹动 |
| 最小尺寸 | 卡牌设最小可读宽度，视口过窄时宁可让卡片部分出屏，由 `overflow-x: clip` 裁切但不产生横向滚动 |
| 跳转 | 卡片即链接，在当前页签直接打开对应项目 |

所有过渡时序统一收敛在 `--dur-fast/base/slow/glacial` 四个时长令牌中，方便后期微调"全局节奏"。

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
│  └─ app-icons.js            # 编译期抓取站点 favicon（只读 apps.json）
├─ apps.json                  # ← 在这里增删项目，提交即生效
├─ index.html
├─ vite.config.js
└─ package.json
```

> 图标缓存在 `node_modules/.cache/app-icons/`，不进版本库。

---

## 📄 License

MIT © Lollipop