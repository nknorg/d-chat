<template>
  <TextMessage v-if="props.type == '1'" :text="props.content" />
  <ImageMessage v-else-if="props.type == '1'" :content="props.content" />
</template>
<script setup lang="ts">
import { defineProps } from 'vue'

import ImageMessage from './contentType/ImageMessage.vue'
import TextMessage from './contentType/TextMessage.vue'

const props = defineProps<{
  type: string,
  content: string
}>()

</script>

