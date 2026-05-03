<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: color }">
      <component v-if="isComponentIcon" :is="icon" />
      <span v-else>{{ icon }}</span>
    </div>
    <div class="stat-content">
      <div class="title">{{ title }}</div>
      <div class="value">{{ value }}</div>
      <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: 0
  },
  icon: {
    type: [String, Object, Function],
    default: '●'
  },
  color: {
    type: String,
    default: '#2f7cf6'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const isComponentIcon = computed(() => {
  return typeof props.icon !== 'string'
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 96px;
  padding: 20px 22px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(15, 35, 65, 0.06);
}

.stat-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-size: 22px;
  box-shadow: 0 10px 20px rgba(47, 124, 246, 0.14);
}

.stat-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.stat-content {
  min-width: 0;
}

.title {
  margin-bottom: 6px;
  color: #6b778c;
  font-size: 14px;
}

.value {
  color: #1f2d3d;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
}

.subtitle {
  margin-top: 8px;
  color: #8a96a8;
  font-size: 12px;
}
</style>
