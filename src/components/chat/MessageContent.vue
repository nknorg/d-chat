<template>
  <TextMessage v-if="props.message.payload.contentType == MessageContentType.text" :message="props.message" />
  <ImageMessage v-else-if="props.message.payload.contentType == MessageContentType.image" :message="props.message" />
</template>
<script setup lang="ts">
import { MessageContentType, MessageSchema } from '@d-chat/core'
import { defineProps } from 'vue'

import ImageMessage from './contentType/ImageMessage.vue'
import TextMessage from './contentType/TextMessage.vue'

const props = defineProps<{
  message: MessageSchema
}>()
</script>
