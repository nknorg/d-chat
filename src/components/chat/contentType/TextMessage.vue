<template>
  <div v-html="safeHtml"></div>
</template>
<script setup lang="ts">
import { MessageSchema } from '@d-chat/core'
import { defineProps, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  message: MessageSchema
}>()

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: renderer
})

const safeHtml = computed(() => {
  const rawHtml = marked.parse(props.message.payload.content || '')
  return rawHtml
})
</script>
