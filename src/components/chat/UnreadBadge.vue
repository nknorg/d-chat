<template>
  <v-badge
    v-if="props.count > 0"
    transition="fab-transition"
    inline
    color="primary"
    :content="getUnReadCount(props.count)"
  >
    <template #badge>
      <transition name="badge-shake" mode="out-in">
        <span :key="props.count" class="animated-badge">{{ getUnReadCount(props.count) }}</span>
      </transition>
    </template>
  </v-badge>
  <span v-else></span>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  count: number
}>()

function getUnReadCount(n: number) {
  if (n == 0) {
    return ''
  } else if (n > 99) {
    return '99+'
  }
  return n
}
</script>

<style scoped>
.badge-shake-enter-active {
  animation: cute-shake 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-shake-leave-active {
  display: none;
}

@keyframes cute-shake {
  0% {
    transform: scale(1) translateX(0);
  }
  10% {
    transform: scale(1.1) translateX(-2px);
  }
  20% {
    transform: scale(0.95) translateX(2px);
  }
  30% {
    transform: scale(1.05) translateX(-2px);
  }
  40% {
    transform: scale(0.98) translateX(2px);
  }
  50% {
    transform: scale(1.03) translateX(-1px);
  }
  60% {
    transform: scale(1) translateX(0);
  }
  100% {
    transform: scale(1) translateX(0);
  }
}
</style>
