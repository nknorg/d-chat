<template>
  <div class="audio-message">
    <div class="audio-player">
      <v-btn icon :color="isPlaying ? 'grey' : 'purple'" @click="togglePlay" class="play-button">
        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
      <div class="audio-info">
        <div class="duration">{{ formatTime(currentTime) }} / {{ formatTime(message.payload.options.mediaDuration) }}</div>
        <v-slider
          v-model="currentTime"
          :thumb-size="12"
          min-width="100"
          color="purple"
          :max="message.payload.options.mediaDuration"
          class="progress-slider"
          hide-details
          @update:model-value="seek"
        ></v-slider>
      </div>
      <audio ref="audioRef" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @ended="onEnded" @error="onError"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { logger, MessageSchema } from '@d-chat/core'
import { defineProps, ref, onMounted, onUnmounted } from 'vue'
import { useCacheStore } from '@/stores/cache'

const props = defineProps<{
  message: MessageSchema
}>()

const cacheStore = useCacheStore()
const audioUrl = ref<string>('')
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const loadAudio = async () => {
  if (props.message.payload.content) {
    try {
      const markdownMatch = props.message.payload.content.match(/!\[audio\]\((data:audio\/[^)]+)\)/)
      if (markdownMatch) {
        const base64Data = markdownMatch[1].replace(/^\/+/, '')
        const mimeType = base64Data.split(',')[0].split(':')[1]
        const base64WithoutPrefix = base64Data.split(',')[1]
        const binaryString = atob(base64WithoutPrefix)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: mimeType })
        audioUrl.value = URL.createObjectURL(blob)
      } else if (props.message.payload.content.startsWith('data:audio/')) {
        const base64Data = props.message.payload.content.replace(/^\/+/, '')
        const mimeType = base64Data.split(',')[0].split(':')[1]
        const base64WithoutPrefix = base64Data.split(',')[1]
        const binaryString = atob(base64WithoutPrefix)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: mimeType })
        audioUrl.value = URL.createObjectURL(blob)
      } else {
        const audioCache = await cacheStore.getCache(props.message.payload.content)
        if (audioCache) {
          audioUrl.value = audioCache.source instanceof Blob ? URL.createObjectURL(audioCache.source) : audioCache.source
        }
      }
    } catch (error) {
      logger.error('Error loading audio:', error)
    }
  }
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const seek = (value: number) => {
  if (!audioRef.value) return
  audioRef.value.currentTime = value
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const onError = (error: Event) => {
  logger.error('Audio playback error:', error)
  const audioElement = error.target as HTMLAudioElement
  logger.error('Audio error code:', audioElement.error?.code)
  logger.error('Audio error message:', audioElement.error?.message)
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

onMounted(async () => {
  await loadAudio()
})

onUnmounted(() => {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style scoped>
.audio-message {
  width: 100%;
  max-width: 300px;
}

.audio-player {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.play-button {
  flex-shrink: 0;
}

.audio-info {
  flex-grow: 1;
  min-width: 0;
}

.duration {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.progress-slider {
  margin: 0;
}

:deep(.v-slider__track) {
  opacity: 0.3;
}

:deep(.v-slider__track-fill) {
  opacity: 0.7;
}
</style>
