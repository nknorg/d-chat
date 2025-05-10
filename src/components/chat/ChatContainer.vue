<template>
  <v-layout v-if="props.targetId" class="fill-height justify-start align-start flex-column">
    <v-container ref="messageContainer" class="fill-height justify-start align-start flex-column-reverse flex-grow-0 overflow-y-auto message-container">
      <MessageItem v-for="msg in messageStore.messageList" :key="msg.payload.id" :message="msg" class="mb-2 mt-2" />
    </v-container>
    <v-fab
      class="scroll-to-bottom-btn"
      color="purple"
      :active="state.showScrollToBottom"
      icon="mdi-chevron-down"
      variant="tonal"
      absolute
      size="small"
      location="bottom right"
      @click="scrollToBottom"
    ></v-fab>
    <v-container class="d-flex flex-grow-0">
      <template v-if="chatStore.currentTargetType === SessionType.TOPIC && !isSubscribed">
        <v-container class="d-flex justify-center align-center">
          <v-alert class="text-center">
            <span class="mr-2">{{ $t('need_re_subscribe') }}</span>
            <v-btn variant="tonal" color="primary" @click="handleJoinTopic">
              <v-icon start>mdi-plus</v-icon>
              {{ $t('join_channel') }}
            </v-btn>
          </v-alert>
        </v-container>
      </template>
      <template v-else>
        <div class="mr-2 align-self-end">
          <v-btn icon color="blue" size="48">
            <svg-icon name="grid" :size="28" />
            <v-menu activator="parent" transition="fade-transition" location="top center">
              <v-card class="d-flex flex-0-0 mt-0 ma-4 pa-4">
                <v-row>
                  <v-col>
                    <v-btn icon color="blue" size="48" @click="sendImage">
                      <svg-icon name="image" :size="28" />
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-btn>
        </div>
        <v-textarea v-model="state.message" autofocus bg-color="grey-lighten-2" color="cyan" rows="1" max-rows="6" auto-grow hide-details @keydown="handleKeydown">
          <template #prepend-inner>
            <AudioRecorder @recorded="handleAudioRecorded" @recording-started="clearAudioPreview" />
            <v-chip v-if="state.audioPreview.blob" label>
              <div class="audio-message">
                <div class="audio-player">
                  <v-btn icon density="compact" size="small" :color="state.audioPreview.isPlaying ? 'red' : 'purple'" class="play-button" @click="toggleAudioPreview">
                    <v-icon>{{ state.audioPreview.isPlaying ? 'mdi-stop' : 'mdi-play' }}</v-icon>
                  </v-btn>
                  <span class="ml-2">{{ formatDuration(state.audioPreview.duration) }}</span>
                  <v-btn icon density="compact" size="small" color="grey" class="ml-2" @click="clearAudioPreview">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-chip>
          </template>
        </v-textarea>
        <div class="align-self-end ml-2">
          <v-btn icon color="blue" size="48" @click="send">
            <svg-icon name="send" :size="28" />
          </v-btn>
        </div>
      </template>
    </v-container>
  </v-layout>
</template>
<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { useMessageStore } from '@/stores/message'
import { FileType, IMessageSchema, MediaOptions, SessionType } from '@d-chat/core'
import { ComponentPublicInstance, defineProps, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import MessageItem from './MessageItem.vue'

const chatStore = useChatStore()
const messageStore = useMessageStore()
const contactStore = useContactStore()

const props = defineProps<{
  targetId?: string
  targetType?: SessionType
}>()

const state = reactive<{
  messages: IMessageSchema[]
  message: string
  showScrollToBottom: boolean
  isLoadingMore: boolean
  messageCount: number
  hasReachedEarliest: boolean
  audioPreview: {
    blob: Blob | null
    duration: number
    fileExt: string
    isPlaying: boolean
  }
}>({
  messages: [],
  message: '',
  showScrollToBottom: false,
  isLoadingMore: false,
  messageCount: 20,
  hasReachedEarliest: false,
  audioPreview: {
    blob: null,
    duration: 0,
    fileExt: '',
    isPlaying: false
  }
})

const messageContainer = ref<ComponentPublicInstance | null>(null)
const isSubscribed = ref(false)

function checkScroll() {
  if (!messageContainer.value) return
  const container = messageContainer.value.$el as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = container

  if (scrollTop <= -scrollHeight + clientHeight + 50 && !state.isLoadingMore) {
    loadMoreMessages()
  }

  state.showScrollToBottom = scrollTop < -100
}

function scrollToBottom() {
  if (!messageContainer.value) return
  const container = messageContainer.value.$el as HTMLElement
  container.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function bindScrollEvent() {
  if (messageContainer.value) {
    const container = messageContainer.value.$el as HTMLElement
    container.addEventListener('scroll', checkScroll)
  }
}

function unbindScrollEvent() {
  if (messageContainer.value) {
    const container = messageContainer.value.$el as HTMLElement
    container.removeEventListener('scroll', checkScroll)
  }
}

onMounted(() => {
  bindScrollEvent()
})

onUnmounted(() => {
  unbindScrollEvent()
})

watch(
  () => props.targetId,
  () => {
    unbindScrollEvent()
    init()
    nextTick(() => {
      bindScrollEvent()
    })
  }
)

watch(
  [() => chatStore.currentTargetId, () => chatStore.currentTargetType],
  async ([newTargetId, newTargetType], [oldTargetId, oldTargetType]) => {
    if (oldTargetType == undefined && newTargetType) {
      await init()
    }
    if (newTargetId && newTargetType === SessionType.TOPIC) {
      const contact = await contactStore.getContactInfo({ type: SessionType.TOPIC, address: newTargetId })
      isSubscribed.value = contact?.joined
    }
  },
  { immediate: true }
)

async function init() {
  if (props.targetId == null || props.targetType == null) return
  state.message = ''
  await chatStore.setCurrentChatTargetId(props.targetId)

  contactStore.queryContactInfo({ type: props.targetType, address: props.targetId })

  state.messageCount = 20
  state.hasReachedEarliest = false
  messageStore.messageList = []
  state.messages = await messageStore.getHistoryMessages(props.targetId, props.targetType, { offset: 0, limit: 20 })
}

async function send() {
  if (state.audioPreview.blob) {
    await sendAudio(state.audioPreview.blob, {
      fileExt: state.audioPreview.fileExt,
      fileType: FileType.AUDIO,
      audioDuration: state.audioPreview.duration,
      mediaDuration: state.audioPreview.duration
    })
    clearAudioPreview()
  } else {
    let msg = state.message
    if (msg == '') return
    state.message = ''
    await chatStore.sendText(props.targetType ?? SessionType.CONTACT, props.targetId, msg)
  }
}

async function sendAudio(data: Blob, options: MediaOptions) {
  if (!props.targetId || !props.targetType) return

  // Convert Blob to base64
  const reader = new FileReader()
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64data = reader.result as string
      resolve(base64data)
    }
  })
  reader.readAsDataURL(data)

  const base64data = await base64Promise

  // Send audio message
  await chatStore.sendAudio(props.targetType, props.targetId, base64data, {
    fileExt: options.fileExt,
    fileType: FileType.AUDIO,
    audioDuration: options.audioDuration,
    mediaDuration: options.mediaDuration
  })
}

async function handleAudioRecorded(audioBlob: Blob, duration: number, fileExt: string) {
  state.audioPreview = {
    blob: audioBlob,
    duration,
    fileExt,
    isPlaying: false
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

let audioPlayer: HTMLAudioElement | null = null

function toggleAudioPreview() {
  if (!state.audioPreview.blob) return

  if (state.audioPreview.isPlaying) {
    audioPlayer?.pause()
    state.audioPreview.isPlaying = false
  } else {
    if (!audioPlayer) {
      audioPlayer = new Audio()
      audioPlayer.onended = () => {
        state.audioPreview.isPlaying = false
      }
    }
    audioPlayer.src = URL.createObjectURL(state.audioPreview.blob)
    audioPlayer.play()
    state.audioPreview.isPlaying = true
  }
}

function clearAudioPreview() {
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.src = ''
  }
  state.audioPreview = {
    blob: null,
    duration: 0,
    fileExt: '',
    isPlaying: false
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      const textarea = e.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = state.message.slice(0, start) + '\n' + state.message.slice(end)
      state.message = newValue
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      })
      e.preventDefault()
    } else {
      e.preventDefault()
      send()
    }
  }
}

async function sendImage() {
  // const filePath = await dialogStore.openFile()
  // if (filePath == null) return
  // await chatStore.sendImage(props.type, props.targetId, filePath)
}

async function loadMoreMessages() {
  if (state.isLoadingMore || !props.targetId || !props.targetType || state.hasReachedEarliest) return
  state.isLoadingMore = true
  try {
    const newMessages = await messageStore.getHistoryMessages(props.targetId, props.targetType, { offset: state.messageCount, limit: 20 })
    if (newMessages.length > 0) {
      state.messageCount += newMessages.length
    } else {
      state.hasReachedEarliest = true
    }
  } finally {
    state.isLoadingMore = false
  }
}

async function handleJoinTopic() {
  if (chatStore.currentTargetId) {
    await chatStore.subscribeTopic(chatStore.currentTargetId)
    const contact = await contactStore.getContactInfo({ type: SessionType.TOPIC, address: chatStore.currentTargetId })
    isSubscribed.value = contact?.joined
  }
}
</script>
<style lang="scss">
.message-container {
  width: 100%;
  flex-wrap: nowrap !important;
  scroll-behavior: smooth;
  padding: 16px;
}

.scroll-to-bottom-btn {
  .v-fab__container {
    right: 20px !important;
    bottom: 120px !important;
  }

  z-index: 999;
}
</style>
