<script setup>
import { computed } from 'vue'
import { useMouse } from '../composables/useMouse.js'

const { x, y } = useMouse()

const orb1Style = computed(() => ({
  transform: `translate3d(${x * -20}px, ${y * -15}px, 0) translate(-50%, -50%)`
}))
const orb2Style = computed(() => ({
  transform: `translate3d(${x * 25}px, ${y * 18}px, 0) translate(-50%, -50%)`
}))
</script>

<template>
  <div class="bg" aria-hidden="true">
    <div class="bg__gradient" />
    <div class="orb orb--1" :style="orb1Style" />
    <div class="orb orb--2" :style="orb2Style" />
  </div>
</template>

<style scoped>
.bg {
  position: fixed;
  inset: 0;
  z-index: var(--z-bg);
  overflow: hidden;
  pointer-events: none;
}

.bg__gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 25% 15%, rgba(168, 139, 250, 0.15), transparent 55%),
    radial-gradient(circle at 80% 85%, rgba(244, 114, 182, 0.12), transparent 55%);
}
:root[data-theme="light"] .bg__gradient {
  background:
    radial-gradient(circle at 25% 15%, rgba(124, 58, 237, 0.08), transparent 55%),
    radial-gradient(circle at 80% 85%, rgba(244, 114, 182, 0.06), transparent 55%);
}

.orb {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.45;
  will-change: transform;
  transition: transform 800ms var(--ease-out);
}
.orb--1 {
  top: 30%;
  left: 18%;
  background: radial-gradient(circle, #a78bfa 0%, transparent 70%);
}
.orb--2 {
  top: 60%;
  left: 78%;
  background: radial-gradient(circle, #f472b6 0%, transparent 70%);
}

:root[data-theme="light"] .orb {
  opacity: 0.32;
}

@media (max-width: 720px) {
  .orb {
    width: 320px;
    height: 320px;
    filter: blur(70px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb { transition: none; }
}
</style>