<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <ContactAvatar :item="contactInfo" />
    </template>
    <template #default="{}">
      <v-list-item-title>{{ contactInfo?.displayName }}</v-list-item-title>
      <v-list-item-subtitle>
        <SessionListMessageSummary :session-item="item" />
      </v-list-item-subtitle>
    </template>
    <template #append>
      <v-layout class="flex-column justify-space-around align-end" style="height: 50px">
        <UnreadBadge :count="item.unReadCount" />
        <span class="body-regular">{{ formatChatTime(item.lastMessageAt) }}</span>
      </v-layout>
      <v-layout class="flex-column justify-space-between align-center" style="height: 50px">
        <span></span>
        <v-btn density="comfortable" size="small" icon="mdi-dots-horizontal" variant="text" @click.stop="null"></v-btn>
      </v-layout>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import UnreadBadge from '@/components/chat/UnreadBadge.vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { useContactStore } from '@/stores/contact'
import { formatChatTime } from '@/utils/format'
import { SessionSchema, ContactSchema } from '@d-chat/core'
import { ref, onMounted } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const contactStore = useContactStore()
const contactInfo = ref<ContactSchema>()

const props = defineProps<{
  item: SessionSchema
}>()

onMounted(async () => {
  const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
  if (contact) {
    contactInfo.value = contact
  }
})

function selectedSession(s: SessionSchema) {
  chatStore.currentTargetId = s.targetId
  chatStore.currentTargetType = s.targetType
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}
</script>
