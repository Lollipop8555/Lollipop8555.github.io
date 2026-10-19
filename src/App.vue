<script setup>
import BackgroundFX from './components/BackgroundFX.vue'
import NavBar from './components/NavBar.vue'
import AppGrid from './components/AppGrid.vue'
</script>

<template>
  <BackgroundFX />
  <NavBar />
  <main class="main">
    <AppGrid />
  </main>
</template>

<style scoped>
.main {
  position: relative;
  z-index: var(--z-content);
  /* 顶部让开固定顶栏；底部留白，最后一张牌能完整收尾 */
  padding-block: 112px 72px;
}

@media (min-width: 720px) {
  .main {
    padding-block: 136px 96px;
  }
}
</style>
