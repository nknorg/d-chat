<template>
  <v-layout v-if="props.targetId" class="fill-height justify-start align-start flex-column">
    <v-container ref="messageContainer" class="fill-height justify-start align-start flex-column-reverse flex-grow-0 overflow-y-auto message-container">
      <MessageItem v-for="msg in messageStore.messageList" :key="msg.payload.id" :message="msg" class="mb-2 mt-2" />
    </v-container>
    <v-fab
      class="scroll-to-bottom-btn"
      :active="state.showScrollToBottom"
      icon="mdi-chevron-down"
      variant="outlined"
      absolute
      size="small"
      location="bottom right"
      @click="scrollToBottom"
    ></v-fab>
    <v-container class="d-flex flex-grow-0">
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
          <AudioRecorder @recorded="handleAudioRecorded" />
        </template>
      </v-textarea>
      <div class="align-self-end ml-2">
        <v-btn icon color="blue" size="48" @click="send">
          <svg-icon name="send" :size="28" />
        </v-btn>
      </div>
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
}>({
  messages: [],
  message: '',
  showScrollToBottom: false,
  isLoadingMore: false,
  messageCount: 20,
  hasReachedEarliest: false
})

const messageContainer = ref<ComponentPublicInstance | null>(null)

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
  (targetId, prevTargetId) => {
    unbindScrollEvent()
    init()
    nextTick(() => {
      bindScrollEvent()
    })
  }
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
  let msg = state.message
  if (msg == '') return
  state.message = ''
  await chatStore.sendText(props.targetType ?? SessionType.CONTACT, props.targetId, msg)
}

async function sendAudio(data: string, options: MediaOptions) {
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

  // console.log('base64data', base64data)
  console.log('duration', options.audioDuration)

  // Send audio message
  await chatStore.sendAudio(props.targetType, props.targetId, base64data, {
    fileExt: 'aac',
    fileType: FileType.AUDIO,
    audioDuration: options.audioDuration,
    mediaDuration: options.mediaDuration
  })
}

async function handleAudioRecorded(audioBlob: Blob, duration: number, fileExt: string) {
  if (!props.targetId || !props.targetType) return

  // Convert Blob to base64
  const reader = new FileReader()
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64data = reader.result as string
      resolve(base64data)
    }
  })
  reader.readAsDataURL(audioBlob)

  const base64data = await base64Promise
  console.log('base64data', base64data)
  // Send audio message
  await chatStore.sendAudio(props.targetType, props.targetId, base64data, {
    fileExt,
    fileType: FileType.AUDIO,
    audioDuration: duration,
    mediaDuration: duration
  })
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
</script>
<style lang="scss">
.message-container {
  width: 100%;
  flex-wrap: nowrap !important;
  scroll-behavior: smooth;
}

.scroll-to-bottom-btn {
  .v-fab__container {
    right: 20px !important;
    bottom: 120px !important;
  }

  z-index: 999;
}
</style>
