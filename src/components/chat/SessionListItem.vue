<template>
  <ContactSessionItem v-if="props.item.targetType == SessionType.CONTACT" :item="item" />
  <TopicSessionItem v-else-if="props.item.targetType == SessionType.TOPIC" :item="item" />
</template>

<script setup lang="ts">
import { SessionSchema, SessionType } from '@d-chat/core'

const props = defineProps<{
  item: SessionSchema
}>()
</script>
