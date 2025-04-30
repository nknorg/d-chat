<template>
  <v-chip label color="info">
    <router-link to="" class="mr-2">
      {{ contactInfo?.displayName || ContactService.getDefaultNickName(props.message.sender) }}
    </router-link>
    {{ $t('unsubscribe') }}
  </v-chip>
</template>
<script setup lang="ts">
import { MessageSchema, SessionType, ContactSchema, ContactService } from '@d-chat/core'
import { defineProps, ref, onMounted } from 'vue'
import { useContactStore } from '@/stores/contact'

const props = defineProps<{
  message: MessageSchema
}>()

const contactStore = useContactStore()
const contactInfo = ref<ContactSchema>()

onMounted(async () => {
  const contact = await contactStore.getContactInfo({
    type: SessionType.CONTACT,
    address: props.message.sender
  })
  if (contact) {
    contactInfo.value = contact
  }
})
</script>
