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
│  └─ app-icons.js            # 编译期抓取站点 favicon（只读 apps.json）
├─ apps.json                  # 项目清单
├─ index.html
├─ vite.config.js
└─ package.json
```

---

## 📄 License

[MIT](LICENSE) © Lollipop
