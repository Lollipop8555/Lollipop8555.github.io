<script setup>
import AppCard from './AppCard.vue'
import { useApps } from '../composables/useApps.js'

const { apps } = useApps()
</script>

<template>
  <div class="deck-root">
    <div v-if="apps.length" class="deck">
      <div
        v-for="(app, i) in apps"
        :key="app.id"
        class="deck__item"
        :style="{ '--i': i }"
      >
        <AppCard :app="app" :index="i" :is-last="i === apps.length - 1" />
      </div>
    </div>

    <p v-else class="empty">暂无内容</p>
  </div>
</template>

<style scoped>
.deck-root {
  width: 100%;
  /* 竖屏：单列竖卡，几乎吃满可用宽度 */
  max-width: 520px;
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
  /* 卡片比例在这里统一定义，AppCard 只消费不定义 */
  --card-ratio-w: 9;
  --card-ratio-h: 16;
}

.deck {
  display: flex;
  flex-direction: column;
  /* 卡牌有最小可读尺寸：视口再窄也不继续压缩，
     宁可让卡片一部分出屏（body 已设 overflow-x: clip，只裁切不产生滚动条）。 */
  min-width: 300px;
}

/* 越靠后的牌层级越高：它压住上一张牌的下沿，
   于是每张牌都只被下一张遮住一点点，像一叠码好的牌。 */
.deck__item {
  position: relative;
  z-index: calc(var(--i, 0) + 1);
}

.empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-8) 0;
  font-size: 0.9rem;
}

/* ── 横版（≥720px）：16:9 横卡 ─────────────────────────────
   左侧留出 1/6 容器宽作为「抽出车道」，卡宽占 5/6。
   卡片抽出量 = 20% 卡宽 = (5/6)/5 = 1/6 容器宽，恰好填满车道。
   因为抽出是纯横向的，纵向不需要任何预留，堆叠多长都不会有空洞；
   同时抽出后只是平移，绝不覆盖上/下一张。 */
@media (min-width: 720px) {
  .deck-root {
    max-width: 860px;
    padding-inline: 24px;
    --card-ratio-w: 16;
    --card-ratio-h: 9;
  }

  .deck {
    /* 左 1/6 空档，右 5/6 卡宽。
       注意：padding 的百分比按「包含块宽度」解析，即 deck-root 的内容宽，
       所以空档恒为内容宽的 1/6，卡宽恒为其 5/6。 */
    padding-left: 16.6667%;
    /* 横版最小卡宽约 585px；窗口再窄就让右侧出屏 */
    min-width: 700px;
  }
}
</style>
