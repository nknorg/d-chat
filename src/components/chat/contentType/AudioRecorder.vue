<template>
  <div class="audio-recorder">
    <v-btn icon variant="text" :color="isRecording ? 'error' : 'purple'" class="record-button" @click="toggleRecording">
      <v-icon>{{ isRecording ? 'mdi-stop' : 'mdi-microphone' }}</v-icon>
    </v-btn>
    <div v-if="isRecording" class="recording-info">
      <div class="duration">{{ formatTime(recordingTime) }}</div>
      <v-slider v-model="recordingTime" :max="maxRecordingTime" color="error" hide-details class="progress-slider" disabled></v-slider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { i18n } from '@/plugins/i18n'
import { ref, onUnmounted } from 'vue'
import { logger } from '@d-chat/core'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
const getFileExtFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'audio/webm;codecs=opus': 'webm',
    'audio/webm': 'webm',
    'audio/x-aac': 'aac',
    'audio/aac': 'aac',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3'
  }
  return mimeToExt[mimeType] || 'webm'
}

const emit = defineEmits<{
  (e: 'recorded', audioBlob: Blob, duration: number, fileExt: string): void
  (e: 'recording-started'): void
}>()

const isRecording = ref(false)
const recordingTime = ref(0)
const maxRecordingTime = 60
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let timer: number | null = null

const startRecording = async () => {
  try {
    // Check if we're in extension environment
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Check supported audio formats
      const mimeTypes = ['audio/x-aac', 'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/webm;codecs=opus', 'audio/webm']

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        logger.warn('No supported audio format found, using default')
        mediaRecorder = new MediaRecorder(stream)
      } else {
        logger.info('Using audio format:', selectedMimeType)
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType
        })
      }

      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType })
        logger.debug('MIME type:', mediaRecorder.mimeType)

        // Get actual duration from audio blob
        const audio = new Audio()
        const durationPromise = new Promise<number>((resolve) => {
          audio.onloadedmetadata = () => {
            if (audio.duration === Infinity) {
              // If duration is Infinity, we need to wait for the audio to be fully loaded
              audio.currentTime = 24 * 60 * 60 // Set to a large value
              audio.ondurationchange = () => {
                resolve(audio.duration)
              }
            } else {
              resolve(audio.duration)
            }
          }
          audio.onerror = () => {
            resolve(recordingTime.value) // Fallback to our timer if can't get actual duration
          }
        })
        audio.src = URL.createObjectURL(audioBlob)

        const actualDuration = await durationPromise
        const fileExt = getFileExtFromMimeType(mediaRecorder.mimeType)
        emit('recorded', audioBlob, Number(actualDuration.toFixed(3)), fileExt)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      isRecording.value = true
      recordingTime.value = 0

      timer = window.setInterval(() => {
        recordingTime.value = Number((recordingTime.value + 0.1).toFixed(3))
        if (recordingTime.value >= maxRecordingTime) {
          stopRecording()
        }
      }, 100)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        if (isExtension) {
          notificationStore.requestPermission({
            title: i18n.global.t('microphone_permission'),
            message: i18n.global.t('microphone_permission_tips')
          })
        }
        return
      }
      throw error
    }
  } catch (error) {
    logger.error('Error starting recording:', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    emit('recording-started')
    startRecording()
  }
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const tenths = Math.floor((time % 1) * 10)
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (mediaRecorder && isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped>
.audio-recorder {
  display: flex;
  align-self: end;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding-bottom: 4px;
}

.record-button {
  flex-shrink: 0;
}

.recording-info {
  flex-grow: 1;
  min-width: 0;
  width: 88px;
}

.duration {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.progress-slider {
  margin: 0;
}
</style>
