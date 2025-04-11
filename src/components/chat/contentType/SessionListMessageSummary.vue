<template>
  <span v-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.image">
    <svg-icon name="image" :size="18" />
  </span>
  <span v-else-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.text">
    {{ props.sessionItem.lastMessagePayload.content }}
  </span>
</template>
<script setup lang="ts">
import { MessageContentType, SessionSchema } from '@d-chat/core'
import { defineProps } from 'vue'

const props = defineProps<{
  sessionItem: SessionSchema
}>()
</script>
