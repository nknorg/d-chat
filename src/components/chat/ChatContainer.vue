<template>
  <v-layout class="fill-height justify-start align-start flex-column">
    <v-container
      class="fill-height justify-start align-start flex-column-reverse flex-grow-0 overflow-y-auto message-container"
    >
      <MessageItem :message="'msg'" class="mb-2" />
      <MessageItem :message="'msg'" class="mb-2" />
      <MessageItem :message="'msg'" class="mb-2" />
      <MessageItem :message="'msg'" class="mb-2" />
      <MessageItem :message="'msg'" class="mb-2" />
      <MessageItem :message="'msg'" class="mb-2" />
    </v-container>

    <v-container class="d-flex flex-grow-0">
      <div class="mr-2 align-self-end">
        <v-btn icon color="blue" size="48" @click="state.showExpansion = !state.showExpansion">
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
      <v-textarea
        autofocus
        bg-color="grey-lighten-2"
        color="cyan"
        rows="1"
        max-rows="6"
        auto-grow
        hide-details
      ></v-textarea>
      <div class="align-self-end ml-2">
        <v-btn icon color="blue" size="48">
          <svg-icon name="send" :size="28" />
        </v-btn>
      </div>
    </v-container>
  </v-layout>
</template>
<script setup lang="ts">
import { defineProps, reactive, watch } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import MessageItem from './MessageItem.vue'
import { SessionType } from '@d-chat/core'

const props = defineProps<{
  targetId: string
  type: SessionType
}>()

const state = reactive<{ messages: any[]; message: string; showExpansion: boolean }>({
  messages: [],
  message: '',
  showExpansion: false
})

async function init() {
  let targetType = props.type
  if (props.type == null) {
    // targetType = await sessionStore.queryByTargetId(props.targetId)
  }

  // await chatStore.setCurrentChatTargetId(props.targetId)
  // state.messages = await messageStore.getMessageList(props.targetId, targetType, {})
}

watch(
  () => props.targetId,
  (targetId, prevTargetId) => {
    init()
  }
)

async function send(e) {
  e.preventDefault()
  let msg = state.message
  if (msg == '') return
  state.message = ''
  // await chatStore.sendText(props.type, props.targetId, msg)
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
}
</style>
