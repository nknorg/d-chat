<template>
  <TextMessage v-if="props.message.payload.contentType == MessageContentType.text" :message="props.message" />
  <ImageMessage v-else-if="props.message.payload.contentType == MessageContentType.media" :message="props.message" />
  <ImageMessage v-else-if="props.message.payload.contentType == MessageContentType.image" :message="props.message" />
  <AudioMessage v-else-if="props.message.payload.contentType == MessageContentType.audio" :message="props.message" />
</template>
<script setup lang="ts">
import { MessageContentType, MessageSchema } from '@d-chat/core'
import { defineProps } from 'vue'

import ImageMessage from './contentType/ImageMessage.vue'
import TextMessage from './contentType/TextMessage.vue'
import AudioMessage from './contentType/AudioMessage.vue'

const props = defineProps<{
  message: MessageSchema
}>()
</script>
