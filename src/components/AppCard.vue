<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { clearReaction, react } from '../composables/useFace.js'

const props = defineProps({
  app: { type: Object, required: true },
  index: { type: Number, default: 0 },
  // 最后一张完整露出，作为整叠的底牌
  isLast: { type: Boolean, default: false }
})

/**
 * 色相与纹样都按 index 顺序命中，新增 app 无需任何配置：
 * 颜色取 HUES[index % 12]，纹样取 MOTIFS[index % 12]，两个池子周期一致。
 *
 * 纹样只是「卡片样式」的装饰，不必凑成一套真扑克，所以用得比四种花色宽。
 * 选字标准：优先 BMP 内、Windows/macOS/Android 覆盖率高的符号，
 * 避免 ❋ ❈ ✹ 这类在 Windows 上会掉成豆腐块的低频字符。
 */
const HUES = [258, 334, 12, 192, 154, 44, 288, 172, 214, 88, 306, 132]
const MOTIFS = ['♠', '♥', '♦', '♣', '★', '✦', '❖', '✧', '✿', '❀', '☘', '☾']

const iconOk = ref(true)

/**
 * 三级降级，逐层往后退：
 *   1. 编译期从站点抓到的真实图标（app.icon）
 *   2. apps.json 里手写的 emoji（站点没有 favicon 时才用）
 *   3. 名称首字
 * iconOk 为 false 表示 <img> 已确认加载失败，直接跳到下一级。
 */
const showIcon = computed(() => Boolean(props.app.icon) && iconOk.value)
const showEmoji = computed(() => !showIcon.value && Boolean(props.app.emoji))
const initial = computed(() => props.app.name.slice(0, 1))
const hue = computed(() => HUES[props.index % HUES.length])
const motif = computed(() => MOTIFS[props.index % MOTIFS.length])

/**
 * 只写域名会让整叠牌重复同一个字符串（本项目所有应用同域），
 * 所以用「域名 + 路径」的完整地址；去掉协议头和末尾斜杠，省掉无意义的 8 个字符。
 */
const address = computed(() => {
  try {
    const { hostname, pathname, search, hash } = new URL(props.app.url)
    const clean = `${hostname.replace(/^www\./, '')}${pathname}${search}${hash}`
    return clean.replace(/\/+$/, '')
  } catch {
    return props.app.url
  }
})

/**
 * 奇偶微微交错，像被随手码好的一叠牌。
 * 幅度必须很小：只有角落那一条露在外面，角度一大边缘就会互相割裂。
 * 底牌端正摆放，它是整叠的收尾。
 */
/**
 * 和字标联动：盯住某张牌时，左上角换成「专注」的表情。
 * 只上报情绪，不关心颜文字长什么样，具体字形由 faces.js 决定。
 */
function inspect() {
  react({ mood: 'busy', hand: 'Y' })
}

onBeforeUnmount(clearReaction)

const style = computed(() => {
  const stagger = props.isLast ? 0 : props.index % 2 === 0 ? -1 : 1
  return {
    '--hue': hue.value,
    '--i': props.index,
    '--tilt': `${stagger * 0.3}deg`,
    '--fan': `${stagger * 1.5}px`
  }
})
</script>

<template>
  <a
    :href="app.url"
    class="card"
    :class="{ 'card--last': isLast }"
    :style="style"
    @pointerenter="inspect"
    @pointerleave="clearReaction"
  >
    <span class="card__face">
      <span class="card__frame" aria-hidden="true" />

      <!-- 中央大图案：扑克牌正中的花色，被上方牌压住也无所谓 -->
      <span class="card__motif" aria-hidden="true">{{ motif }}</span>

      <!-- 名称在左上、图标在右上：叠起来时唯一必须看清的一整行 -->
      <span class="card__corner">
        <span class="card__name">{{ app.name }}</span>
        <span class="card__icon" aria-hidden="true">
          <img
            v-if="showIcon"
            class="card__icon-img"
            :src="app.icon"
            alt=""
            loading="lazy"
            decoding="async"
            @error="iconOk = false"
          />
          <span v-else-if="showEmoji" class="card__emoji">{{ app.emoji }}</span>
          <span v-else class="card__initial">{{ initial }}</span>
        </span>
      </span>

      <!-- 左缘竖排地址：贴着抽出方向，牌弹出来时整条都在视野里 -->
      <span class="card__spine" aria-hidden="true" :title="app.url">{{ address }}</span>
    </span>
  </a>
</template>

<style scoped>
/* 外层锚点只占「露出来的那一条」，牌面绝对定位向下溢出、被下一张压住。
   悬停只让牌面横向移出、锚点不动，命中区域因此恒定，不会闪进闪出。 */
.card {
  /* 比例令牌定义在 .deck-root 上，这里只做兜底 */
  --ratio-w: var(--card-ratio-w, 9);
  --ratio-h: var(--card-ratio-h, 16);
  /* 露出比例：只露角落那一条，其余被下一张压住 —— 这才是牌包里的手感 */
  --band: 0.19;
  /* 抽出量：百分比相对牌面自身宽度，横向抽出 20% 卡宽，
     正好填满 AppGrid 在左侧预留的那一条空档，不多不少 */
  --lift: -20%;

  position: relative;
  display: block;
  height: 0;
  /* block 的百分比 padding 恒等于宽度 × 该比例，
     于是「露出高度」跟着容器宽度自适应，横卡竖卡都不需要 JS 测量 */
  padding-top: calc(100% * var(--ratio-h) / var(--ratio-w) * var(--band));
  color: var(--text-primary);
  text-decoration: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* 底牌不参与压叠：整张露出，作为一个完整样例收尾 */
.card--last {
  padding-top: calc(100% * var(--ratio-h) / var(--ratio-w));
}

/* 只有「横版布局 + 精确指针」才建立图层；竖屏与触屏不为抽出准备合成资源 */
@media (hover: hover) and (pointer: fine) and (min-width: 720px) {
  .card:hover .card__face,
  .card:focus-visible .card__face {
    will-change: transform;
  }
}

/* 真正的牌面：比例由 --ratio 决定，宽度撑满锚点后高度自动推导 */
.card__face {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  aspect-ratio: var(--ratio-w) / var(--ratio-h);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid hsl(var(--hue) 70% 66% / 0.28);
  background:
    radial-gradient(120% 130% at 0% 0%, hsl(var(--hue) 96% 68% / 0.32), transparent 60%),
    linear-gradient(
      158deg,
      hsl(var(--hue) 55% 30%) 0%,
      hsl(var(--hue) 50% 19%) 52%,
      hsl(var(--hue) 42% 13%) 100%
    );
  box-shadow:
    0 22px 40px -26px hsl(var(--hue) 85% 25% / 0.9),
    0 10px 20px -12px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 hsl(var(--hue) 90% 85% / 0.14);
  transform: translate3d(var(--fan, 0px), 0, 0) rotate(var(--tilt, 0deg));
  transform-origin: 50% 92%;
  transition:
    transform 480ms var(--ease-spring),
    box-shadow 380ms var(--ease-out),
    border-color 380ms var(--ease-out);
  animation: dealIn 640ms var(--ease-out) backwards;
  animation-delay: calc(var(--i, 0) * 70ms);
}

:root[data-theme="light"] .card__face {
  background:
    radial-gradient(120% 130% at 0% 0%, hsl(var(--hue) 92% 66% / 0.24), transparent 58%),
    linear-gradient(
      158deg,
      hsl(var(--hue) 85% 97%) 0%,
      hsl(var(--hue) 75% 93%) 52%,
      hsl(var(--hue) 62% 88%) 100%
    );
  box-shadow:
    0 22px 40px -28px hsl(var(--hue) 60% 40% / 0.5),
    0 10px 20px -14px rgba(20, 20, 32, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* 悬停时扫过牌面的一道光 */
.card__face::before {
  content: '';
  position: absolute;
  inset: -30% -35%;
  z-index: 3;
  background: linear-gradient(
    112deg,
    transparent 40%,
    hsl(var(--hue) 100% 94% / 0.14) 49%,
    transparent 58%
  );
  transform: translate3d(-60%, 0, 0);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 760ms var(--ease-out),
    opacity 320ms var(--ease-out);
}

/* 牌的内框线 */
.card__frame {
  position: absolute;
  inset: 10px;
  border-radius: 16px;
  border: 1px solid hsl(var(--hue) 80% 78% / 0.13);
  pointer-events: none;
  transition: border-color 380ms var(--ease-out);
}

/* 中央大图案：绝对定位居中，不撑开任何布局，被压住也完全不影响信息 */
.card__motif {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 300px;
  line-height: 0.8;
  color: hsl(var(--hue) 95% 78% / 0.13);
  pointer-events: none;
  user-select: none;
  transform: rotate(-8deg);
  transition:
    color 380ms var(--ease-out),
    transform 520ms var(--ease-spring);
}
:root[data-theme="light"] .card__motif {
  color: hsl(var(--hue) 70% 45% / 0.16);
}

/* 信息区横贯牌顶：名称靠左，图标靠右，叠放时这一整行都必须看清 */
.card__corner {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  /* 左侧让出竖排地址的车道，避免和名称撞在一起 */
  padding: 26px 26px 20px 44px;
}

.card__icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 30%;
  overflow: hidden;
  background: linear-gradient(
    160deg,
    hsl(var(--hue) 90% 68%),
    hsl(var(--hue) 80% 45%)
  );
  box-shadow:
    0 8px 16px -8px hsl(var(--hue) 85% 30% / 0.8),
    inset 0 1px 0 hsl(var(--hue) 100% 92% / 0.4);
  transition: transform 520ms var(--ease-spring);
}

.card__icon-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 站点确实没有 favicon 时，用 apps.json 里手写的 emoji 顶上 */
.card__emoji {
  font-size: 1.5rem;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

/* 连 emoji 都没写时的最后兜底：名称首字，体量与图标一致，不破坏角落对齐 */
.card__initial {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
  color: hsl(var(--hue) 100% 96% / 0.92);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.card__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;
  /* 角落空间有限，名称保持单行；超长才省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 首字放大：中文读作一枚「领字」，英文读作花体起笔。
   用 ::first-letter 而不是拆 DOM，屏幕阅读器仍读到完整名称。 */
.card__name::first-letter {
  font-size: 1.35em;
  font-weight: 700;
  color: hsl(var(--hue) 100% 90% / 0.95);
  margin-right: 0.04em;
  text-shadow: 0 2px 12px hsl(var(--hue) 90% 60% / 0.4);
}
:root[data-theme="light"] .card__name::first-letter {
  color: hsl(var(--hue) 72% 40%);
  text-shadow: none;
}

/* 左缘竖排地址：像防伪码一样沿卡片边缘排布，超出卡面自然渐隐。
   放左侧是因为牌只会向左抽出，左侧这一条永远可见。 */
.card__spine {
  position: absolute;
  top: 24px;
  left: 16px;
  bottom: 24px;
  z-index: 2;
  writing-mode: vertical-rl;
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  color: hsl(var(--hue) 60% 90% / 0.4);
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  /* 被卡面高度截断时用渐隐收尾，避免出现半截字 */
  -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 72%, transparent 100%);
}
:root[data-theme="light"] .card__spine {
  color: hsl(var(--hue) 45% 40% / 0.5);
}

/* 宽屏：16:9 横卡。内容仍是左上角信息 + 中央图案 + 右缘竖排地址，
   只是露出比例按横卡高度重算，保证露出的那条能容纳整个角落行 */
@media (min-width: 720px) {
  .card {
    --band: 0.3;
  }

  .card__corner {
    gap: 16px;
    padding: 28px 30px 24px 50px;
  }

  .card__icon {
    width: 52px;
    height: 52px;
    border-radius: 28%;
  }

  .card__emoji {
    font-size: 1.7rem;
  }

  .card__initial {
    font-size: 1.3rem;
  }

  .card__name {
    font-size: 1.18rem;
  }

  .card__name::first-letter {
    font-size: 1.45em;
  }

  .card__motif {
    font-size: 340px;
  }

  .card__spine {
    top: 26px;
    left: 18px;
    bottom: 26px;
    font-size: 0.58rem;
  }
}

/* 悬停 / 键盘聚焦：整张牌向左抽出，填满左侧预留的空档。
   纵向位置完全不动，层级也不变（仍是 index + 1），
   所以抽出后依然被下一张压住，绝不会遮住任何兄弟牌的角落信息。
   只在横版 + 精确指针下生效：竖屏安静叠着，不做悬浮弹动。 */
@media (hover: hover) and (pointer: fine) and (min-width: 720px) {
  .card:hover .card__face,
  .card:focus-visible .card__face {
    transform: translate3d(var(--lift), 0, 0) rotate(0deg);
    border-color: hsl(var(--hue) 85% 72% / 0.5);
    box-shadow:
      0 26px 46px -24px hsl(var(--hue) 85% 28% / 0.95),
      0 12px 22px -14px rgba(0, 0, 0, 0.5),
      0 0 0 1px hsl(var(--hue) 85% 72% / 0.2),
      inset 0 1px 0 hsl(var(--hue) 95% 88% / 0.18);
  }

  .card:hover .card__face::before {
    opacity: 1;
    transform: translate3d(55%, 0, 0);
  }

  .card:hover .card__icon {
    transform: scale(1.05) rotate(-2deg);
  }

  .card:hover .card__motif {
    color: hsl(var(--hue) 95% 82% / 0.22);
    transform: rotate(0deg) scale(1.03);
  }

  /* 浅色牌面下阴影要收着点，否则像贴了一张黑卡 */
  :root[data-theme="light"] .card:hover .card__face {
    box-shadow:
      0 26px 46px -26px hsl(var(--hue) 60% 40% / 0.45),
      0 12px 22px -16px rgba(20, 20, 32, 0.22),
      0 0 0 1px hsl(var(--hue) 70% 60% / 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  /* 按下时回落到半程，但仍保持摆正，避免「抽到一半又歪回去」 */
  .card:active .card__face {
    transform: translate3d(calc(var(--lift) * 0.55), 0, 0) rotate(0deg);
  }

  /* 键盘聚焦需要比悬停更强的可见指示 */
  .card:focus-visible .card__face {
    box-shadow:
      0 0 0 3px hsl(var(--hue) 90% 66% / 0.4),
      0 26px 44px -24px hsl(var(--hue) 85% 28% / 0.9);
  }
}

@keyframes dealIn {
  from {
    opacity: 0;
    transform: translate3d(var(--fan, 0px), 16px, 0) rotate(calc(var(--tilt, 0deg) * 2.2));
  }
}

/* 竖屏 / 窄窗：没有向左抽出的车道，改成轻轻上浮一档。
   上浮量 14px 远小于露出带高度（约 120~160px），也远小于上一张牌
   角落信息所在的纵向范围，所以只会多露出自己的一点点牌面，
   绝不会压住上一张的名称与图标。
   与上面的横版规则媒体查询互斥（719.98px / 720px），互不干扰。 */
@media (hover: hover) and (pointer: fine) and (max-width: 719.98px) {
  .card:hover .card__face,
  .card:focus-visible .card__face {
    transform: translate3d(var(--fan, 0px), -14px, 0) rotate(var(--tilt, 0deg));
    border-color: hsl(var(--hue) 85% 72% / 0.42);
    box-shadow:
      0 26px 44px -26px hsl(var(--hue) 85% 28% / 0.95),
      0 14px 24px -16px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 hsl(var(--hue) 95% 88% / 0.16);
  }

  :root[data-theme="light"] .card:hover .card__face {
    box-shadow:
      0 26px 44px -28px hsl(var(--hue) 60% 40% / 0.4),
      0 14px 24px -18px rgba(20, 20, 32, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  /* 只给一点微弱的响应，不做旋转，避免窄屏上动作过多 */
  .card:hover .card__icon {
    transform: scale(1.04);
  }

  .card:focus-visible .card__face {
    box-shadow:
      0 0 0 3px hsl(var(--hue) 90% 66% / 0.4),
      0 26px 44px -26px hsl(var(--hue) 85% 28% / 0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card__face,
  .card__icon,
  .card__motif,
  .card__face::before {
    animation: none !important;
    transition: none !important;
  }
}
</style>
