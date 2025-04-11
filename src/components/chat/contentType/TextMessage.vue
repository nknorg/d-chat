<template>
  <div v-html="safeHtml"></div>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  text: string
}>()

marked.setOptions({
  gfm: true,
  breaks: true
})

const safeHtml = computed(() => {
  const rawHtml = marked.parse(props.text || '')
  return rawHtml
})
</script>
