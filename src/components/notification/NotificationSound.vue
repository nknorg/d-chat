<template>
  <audio ref="audioRef" src="/assets/sfx/notification.ogg" style="display: none" />
</template>

<script setup lang="ts">
import { logger } from '@d-chat/core'
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const audioRef = ref<HTMLAudioElement>()
const notificationStore = useNotificationStore()

// Play notification sound
const playSound = () => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    audioRef.value.play().catch((error) => {
      logger.error('Failed to play notification sound:', error)
    })
  }
}

onMounted(() => {
  notificationStore.setSoundComponent({ playSound })
})

defineExpose({
  playSound
})
</script>
