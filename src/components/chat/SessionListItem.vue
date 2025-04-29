<template>
  <ContactSessionItem v-if="props.item.targetType == SessionType.CONTACT" :item="item" />
  <TopicSessionItem v-else-if="props.item.targetType == SessionType.TOPIC" :item="item" />
</template>

<script setup lang="ts">
import { SessionSchema, SessionType } from '@d-chat/core'
import { onBeforeMount } from 'vue'
import { useContactStore } from '@/stores/contact'

const contactStore = useContactStore()
const props = defineProps<{
  item: SessionSchema
}>()

onBeforeMount(() => {
  contactStore.queryContactInfo({ type: props.item.targetType, address: props.item.targetId })
})
</script>
