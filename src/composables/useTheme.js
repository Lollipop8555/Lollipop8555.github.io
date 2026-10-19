import { ref, watch } from 'vue'

const STORAGE_KEY = 'lollipop-theme'

function getInitial() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch (e) {}
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

// 单例主题状态，跨组件共享
const theme = ref(getInitial())

function apply(value) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = value
  }
}

// 初始化时立即应用（处理 SSR / 测试环境）
apply(theme.value)

watch(theme, (v) => {
  apply(v)
  try {
    localStorage.setItem(STORAGE_KEY, v)
  } catch (e) {}
})

export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  const set = (value) => {
    if (value === 'dark' || value === 'light') theme.value = value
  }
  return { theme, toggle, set }
}