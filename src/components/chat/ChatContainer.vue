<template>
  <v-layout v-if="props.targetId" class="fill-height justify-start align-start flex-column">
    <v-container ref="messageContainer" class="fill-height justify-start align-start flex-column-reverse flex-grow-0 overflow-y-auto message-container">
      <MessageItem v-for="msg in messageStore.messageList" :key="msg.payload.id" :message="msg" class="mb-2" />
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
              <v-btn icon color="blue" size="48" @click="sendImage">
                <svg-icon name="image" :size="28" />
              </v-btn>
            </v-card>
          </v-menu>
        </v-btn>
      </div>
      <v-textarea v-model="state.message" autofocus bg-color="grey-lighten-2" color="cyan" rows="1" max-rows="6" auto-grow hide-details @keydown="handleKeydown"></v-textarea>
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
import { useMessageStore } from '@/stores/message'
import { useSessionStore } from '@/stores/session'
import { IMessageSchema, SessionType } from '@d-chat/core'
import { defineProps, nextTick, reactive, watch, ref, onMounted, onUnmounted, ComponentPublicInstance } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import MessageItem from './MessageItem.vue'

const sessionStore = useSessionStore()
const chatStore = useChatStore()
const messageStore = useMessageStore()

const props = defineProps<{
  targetId?: string
  targetType?: SessionType
}>()

const state = reactive<{
  messages: IMessageSchema[]
  message: string
  showScrollToBottom: boolean
}>({
  messages: [],
  message: '',
  showScrollToBottom: false
})

const messageContainer = ref<ComponentPublicInstance | null>(null)

function checkScroll() {
  if (!messageContainer.value) return
  const container = messageContainer.value.$el as HTMLElement
  const { scrollTop } = container
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

onMounted(() => {
  if (messageContainer.value) {
    const container = messageContainer.value.$el as HTMLElement
    container.addEventListener('scroll', checkScroll)
  }
})

onUnmounted(() => {
  if (messageContainer.value) {
    const container = messageContainer.value.$el as HTMLElement
    container.removeEventListener('scroll', checkScroll)
  }
})

watch(
  () => messageStore.messageList,
  () => {
    nextTick(() => {
      scrollToBottom()
      state.showScrollToBottom = false
    })
  },
  { deep: true }
)

async function init() {
  if (props.targetId == null || props.targetType == null) return

  await chatStore.setCurrentChatTargetId(props.targetId)
  state.messages = await messageStore.getHistoryMessages(props.targetId, props.targetType)
}

watch(
  () => props.targetId,
  (targetId, prevTargetId) => {
    init()
  }
)

async function send() {
  let msg = state.message
  if (msg == '') return
  state.message = ''
  await chatStore.sendText(props.targetType ?? SessionType.CONTACT, props.targetId, msg)
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
