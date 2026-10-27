<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useFace } from '../composables/useFace.js'
import { useGaze } from '../composables/useGaze.js'

const { theme, toggle } = useTheme()

/**
 * 字标会随状态变脸：括号是语气，两只眼是情绪，末位字符是手势。
 * 只有眼睛恰好是 oo 时才有糖果互换，其余表情保持字形本身。
 */
const { face, enter, leave, onFocus, onBlur, cheer, pressStart } = useFace()
const candy = computed(() => face.value.eyes === 'oo')

// 眼珠跟着指针偏一点点，位移写在 .face 上的 CSS 变量里
const faceEl = ref(null)
useGaze(faceEl)

const scrolled = ref(false)
let raf = 0
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 24
    raf = 0
  })
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled }">
    <div class="container nav__inner">
      <a
        class="nav__brand"
        href="#"
        aria-label="Lollipop Home"
        @mouseenter="enter"
        @mouseleave="leave"
        @focus="onFocus"
        @blur="onBlur"
        @pointerdown="pressStart"
        @click="cheer"
      >
        <span class="nav__logo" aria-hidden="true">
          <!-- 颜文字字标：括号是语气，两只眼是情绪，最后一个字符是手势 -->
          <span
            ref="faceEl"
            class="face"
            :class="{ 'face--candy': candy }"
            :data-mood="face.mood"
          >
            <span class="face__cell face__cell--bracket">{{ face.open }}</span>
            <span class="face__cell face__cell--eye">
              <span class="face__o">{{ face.left }}</span>
              <span v-if="candy" class="face__candy"></span>
            </span>
            <span class="face__cell face__cell--eye">
              <span class="face__o">{{ face.right }}</span>
              <span v-if="candy" class="face__candy"></span>
            </span>
            <span class="face__cell face__cell--bracket">{{ face.close }}</span>
            <span class="face__cell face__cell--wave">{{ face.handGlyph }}</span>
          </span>
        </span>
        <span class="nav__title">Lollipop</span>
      </a>

      <div class="nav__actions">
        <button
          class="theme-toggle"
          :aria-label="`切换到${theme === 'dark' ? '浅色' : '深色'}主题`"
          @click="toggle"
        >
          <span :key="theme" class="theme-toggle__icon" aria-hidden="true">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="4" fill="currentColor"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  padding-block: var(--space-4);
  transition: padding var(--dur-base) var(--ease-out),
    background-color var(--dur-base) var(--ease-out),
    backdrop-filter var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}

.nav--scrolled {
  padding-block: var(--space-3);
  background: var(--bg-surface);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 8px 32px -12px rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid var(--border-subtle);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  transition: opacity var(--dur-fast) var(--ease-out);
}
.nav__brand:hover { opacity: 0.85; }

/* 五格等宽：括号 + 两只眼 + 挥手，任何变体都不能让宽度跳动。
   盒子按内容自适应宽度（只给最小尺寸），避免不同机型 monospace 字形宽度
   差异把颜文字挤出 64px 固定框、在手机上变成“空方块”。 */
.nav__logo {
  min-width: 56px;
  height: 36px;
  padding-inline: 10px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--bg-surface-strong);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-glow);
  transition: transform var(--dur-base) var(--ease-spring);
}
.nav__brand:hover .nav__logo {
  transform: rotate(-6deg) scale(1.05);
}

.face {
  display: grid;
  grid-auto-flow: column;
  /* 眼睛两格略宽，给糖果留出间距；总宽固定，hover 不会改布局 */
  grid-template-columns: 1ch 1.4ch 1.4ch 1ch 1ch;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1;
  letter-spacing: 0;
  font-variant-ligatures: none;
  color: var(--text-primary);
  user-select: none;
}

.face__cell {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 1em;
}

/* 眼珠跟着指针偏一点点：只挪眼睛所在的两格，字标与括号纹丝不动 */
.face__cell--eye {
  transform: translate3d(var(--gaze-x, 0px), var(--gaze-y, 0px), 0);
}

.face__cell--bracket {
  color: var(--text-secondary);
  transition: color var(--dur-fast) var(--ease-out);
}
.nav__brand:hover .face__cell--bracket {
  color: var(--text-primary);
}

/* o 与糖果叠在同一格里，靠透明度互换，不参与布局 */
.face__o {
  display: block;
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}
/* 只有眼睛是 oo 时，才把 o 换成糖果；其他表情原样显示 */
.nav__brand:hover .face--candy .face__o,
.nav__brand:focus-visible .face--candy .face__o {
  opacity: 0;
  transform: scale(0.4);
}

.face__candy {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 11px;
  height: 11px;
  margin: -5.5px 0 0 -5.5px;
  border-radius: 50%;
  background: var(--accent-gradient);
  box-shadow: 0 0 10px -2px rgba(244, 114, 182, 0.55);
  opacity: 0;
  transform: scale(0.35) rotate(-30deg);
  transition: opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}
.face__candy::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2.5px;
  width: 4.5px;
  height: 2.6px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.6;
  transform: rotate(-18deg);
}
.nav__brand:hover .face__candy,
.nav__brand:focus-visible .face__candy {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.face__cell--wave {
  transform-origin: 50% 85%;
}
.nav__brand:hover .face__cell--wave {
  animation: face-wave 900ms var(--ease-in-out) 1;
}

@keyframes face-wave {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  30% {
    transform: rotate(14deg) translateY(-1px);
  }
  65% {
    transform: rotate(-8deg) translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav__brand:hover .nav__logo,
  .nav__brand:hover .face__cell--wave {
    transform: none;
    animation: none;
  }
  .face__o,
  .face__candy,
  .face__cell--bracket {
    transition: none;
  }
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* 主题切换：圆形按钮，点击时图标旋转弹入 */
.theme-toggle {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition: transform var(--dur-fast) var(--ease-spring),
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.theme-toggle:hover {
  transform: translateY(-2px);
  color: var(--text-primary);
  border-color: var(--border-strong);
}
.theme-toggle:active {
  transform: scale(0.92);
}
.theme-toggle__icon {
  display: grid;
  place-items: center;
  /* theme 作为 key，每次切换都重挂载，触发一次弹入动画 */
  animation: theme-pop var(--dur-base) var(--ease-spring);
}
@keyframes theme-pop {
  0% {
    transform: rotate(-90deg) scale(0.4);
    opacity: 0;
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
}
</style>