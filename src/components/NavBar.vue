<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const { theme, toggle } = useTheme()

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
      <a class="nav__brand" href="#" aria-label="Lollipop Home">
        <span class="nav__logo" aria-hidden="true">
          <!-- 颜文字字标：两个 l 化作括号，oo 是眼睛，y 是挥手 -->
          <span class="face">
            <span class="face__cell face__cell--bracket">(</span>
            <span class="face__cell face__cell--eye">
              <span class="face__o">o</span>
              <span class="face__candy"></span>
            </span>
            <span class="face__cell face__cell--eye">
              <span class="face__o">o</span>
              <span class="face__candy"></span>
            </span>
            <span class="face__cell face__cell--bracket">)</span>
            <span class="face__cell face__cell--wave">y</span>
          </span>
        </span>
        <span class="nav__title">Lollipop</span>
      </a>

      <div class="nav__actions">
        <a
          href="https://github.com/Lollipop8555"
          target="_blank"
          rel="noopener noreferrer"
          class="nav__github"
          aria-label="GitHub"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.94 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.54.11-3.21 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.67.24 2.9.12 3.21.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/>
          </svg>
        </a>

        <button
          class="theme-toggle"
          :aria-label="`切换到${theme === 'dark' ? '浅色' : '深色'}主题`"
          @click="toggle"
        >
          <span class="theme-toggle__track">
            <span class="theme-toggle__thumb" :class="{ 'is-light': theme === 'light' }">
              <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            </span>
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

/* 五格等宽：括号 + 两只眼 + 挥手，任何变体都不能让宽度跳动 */
.nav__logo {
  width: 64px;
  height: 36px;
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
.nav__brand:hover .face__o,
.nav__brand:focus-visible .face__o {
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

.nav__github {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition: transform var(--dur-fast) var(--ease-spring),
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.nav__github:hover {
  transform: translateY(-2px) rotate(-3deg);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

/* 主题切换胶囊 */
.theme-toggle {
  padding: 0;
  border-radius: var(--radius-pill);
}
.theme-toggle__track {
  position: relative;
  display: inline-flex;
  width: 56px;
  height: 30px;
  border-radius: var(--radius-pill);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: background var(--dur-base) var(--ease-out);
}
.theme-toggle__thumb {
  position: absolute;
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
  transition: left var(--dur-base) var(--ease-spring);
}
.theme-toggle__thumb.is-light {
  left: calc(100% - 26px);
}

@media (max-width: 480px) {
  .nav__brand span:last-child { display: none; }
}
</style>