<template>
  <div class="image-message">
    <v-img v-if="imageUrl" class="cursor-pointer" :src="imageUrl" width="200px" @click="showModal = true" />

    <v-dialog v-model="showModal" width="80vw" transition="dialog-bottom-transition">
      <v-card class="h-100">
        <v-toolbar>
          <v-btn icon="mdi-close" @click="showModal = false"></v-btn>
          <v-toolbar-title>{{ $t('image') }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-0 flex-grow-1 d-flex">
          <v-img :src="imageUrl" class="flex-grow-1" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { MessageSchema } from '@d-chat/core'
import { marked } from 'marked'
import { computed, defineProps, ref } from 'vue'

const props = defineProps<{
  message: MessageSchema
}>()

const showModal = ref(false)

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: renderer
})


// Extract image URL from content
const imageUrl = computed(() => {
  const content = props.message.payload.content || ''
  // Simple regex to find image URL in markdown or plain text
  const match = content.match(/!?\[.*?\]\((.*?)\)|(https?:\/\/.*?\.(?:png|jpg|jpeg|gif|webp))/i)
  return match ? (match[1] || match[2]) : null
})
</script>

<style lang="scss" scoped>
:deep(.v-card) {
  height: 100%;

  overflow: hidden;
}

:deep(.v-card-text) {
  min-height: 0;
}
</style>
