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

marked.setOptions({
  gfm: true,
  breaks: true
})

const safeHtml = computed(() => {
  const rawHtml = marked.parse(props.message.payload.content || '')
  return rawHtml
})
</script>
