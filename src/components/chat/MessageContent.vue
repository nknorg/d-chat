<template>
  <TextMessage v-if="props.type == MessageContentType.text" :text="props.content" />
  <ImageMessage v-else-if="props.type == MessageContentType.image" :content="props.content" />
</template>
<script setup lang="ts">
import { MessageContentType } from '@d-chat/core'
import { defineProps } from 'vue'

import ImageMessage from './contentType/ImageMessage.vue'
import TextMessage from './contentType/TextMessage.vue'

const props = defineProps<{
  type: string
  content: string
}>()
</script>
