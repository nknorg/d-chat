<template>
  <audio ref="audioRef" :src="notificationSound" style="display: none" />
</template>

<script setup lang="ts">
import notificationSound from '@assets/sfx/notification.ogg'
import { useNotificationStore } from '@/stores/notification'
import { logger } from '@d-chat/core'
import { onMounted, ref } from 'vue'

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
