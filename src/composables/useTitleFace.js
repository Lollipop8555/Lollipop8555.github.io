import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 标签页标题彩蛋。
 *
 * looly 的两个 l 正好可以当作一对括号，oo 是眼睛，y 是挥手：
 *   (oo)y  默认   [00]y  冷静   {oo}y  代码感
 *
 * 只在标签页可见时轮播；切走时换成睡觉的表情并停掉计时器，
 * 回来再从当前标题继续，避免后台空转和标题闪烁。
 */
const BASE_TITLE = 'Lollipop · Home'
const TITLES = [BASE_TITLE, '(oo)y · Lollipop', '[00]y · Lollipop', '{oo}y · Lollipop']
const SLEEPING_TITLE = '(- -)y zZ'
const STEP = 5000

export function useTitleFace() {
  let timer = 0
  let index = 0
  let hidden = false

  function paint() {
    if (typeof document === 'undefined') return
    document.title = hidden ? SLEEPING_TITLE : TITLES[index]
  }

  function stop() {
    if (!timer) return
    clearInterval(timer)
    timer = 0
  }

  function start() {
    stop()
    timer = window.setInterval(() => {
      index = (index + 1) % TITLES.length
      paint()
    }, STEP)
  }

  function onVisibilityChange() {
    hidden = document.visibilityState === 'hidden'
    if (hidden) stop()
    else start()
    paint()
  }

  onMounted(() => {
    paint()
    document.addEventListener('visibilitychange', onVisibilityChange)
    start()
  })

  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    document.title = BASE_TITLE
  })
}
