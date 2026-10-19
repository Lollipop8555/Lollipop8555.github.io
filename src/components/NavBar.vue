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
          <svg viewBox="0 0 24 24" width="22" height="22">
            <defs>
              <linearGradient id="brandg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#a78bfa"/>
                <stop offset="0.5" stop-color="#f472b6"/>
                <stop offset="1" stop-color="#fb923c"/>
              </linearGradient>
            </defs>
            <g transform="translate(12 12) rotate(-15) translate(-12 -12)">
              <circle cx="12" cy="8" r="5" fill="url(#brandg)"/>
              <ellipse cx="10" cy="6" rx="1.6" ry="1" fill="#fff" opacity="0.55"/>
              <rect x="11" y="12" width="2" height="11" rx="1" fill="currentColor"/>
            </g>
          </svg>
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

.nav__logo {
  width: 36px;
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
  transform: rotate(-12deg) scale(1.05);
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