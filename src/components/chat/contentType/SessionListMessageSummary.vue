<template>
  <span v-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.text">
    {{ props.sessionItem.lastMessagePayload.content }}
  </span>
  <span v-else-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.media">
    <svg-icon name="image" :size="18" />
  </span>
  <span v-else-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.image">
    <svg-icon name="image" :size="18" />
  </span>
  <span v-else-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.audio">
    <svg-icon name="microphone" :size="18" />
  </span>
  <span v-else-if="props.sessionItem.lastMessagePayload?.contentType === MessageContentType.topicSubscribe">
    {{ contactInfo?.displayName || ContactService.getNameByContact(contactInfo) }} {{ $t('joined_channel') }}
  </span>
</template>
<script setup lang="ts">
import { MessageContentType, SessionSchema, SessionType, ContactSchema, ContactService } from '@d-chat/core'
import { defineProps, ref, onMounted } from 'vue'
import { useContactStore } from '@/stores/contact'

const props = defineProps<{
  sessionItem: SessionSchema
}>()

const contactStore = useContactStore()
const contactInfo = ref<ContactSchema>()

onMounted(async () => {
  if (props.sessionItem.lastMessageSender) {
    const contact = await contactStore.getContactInfo({
      type: SessionType.CONTACT,
      address: props.sessionItem.lastMessageSender
    })
    if (contact) {
      contactInfo.value = contact
    }
  }
})
</script>
