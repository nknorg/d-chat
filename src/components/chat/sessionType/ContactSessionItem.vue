<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <ContactAvatar :item="contactInfo" />
    </template>
    <template #default="{}">
      <v-list-item-title class="d-flex align-center">
        <template v-if="contactInfo">
          {{ contactInfo.displayName }}
        </template>
        <template v-else>
          <v-skeleton-loader class="pa-0" type="text" width="120" color="transparent"></v-skeleton-loader>
        </template>
      </v-list-item-title>
      <v-list-item-title class="d-flex align-center">
        <v-skeleton-loader type="" color="transparent"></v-skeleton-loader>
      </v-list-item-title>
      <v-list-item-subtitle class="d-flex align-center">
        <SessionListMessageSummary class="text-truncate" :session-item="item" />
      </v-list-item-subtitle>
    </template>
    <template #append>
      <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
        <UnreadBadge :count="item.unReadCount" />
        <v-layout class="d-flex align-center">
          <v-chip class="flex-0-0" label size="small" density="compact" variant="text">{{ formatChatTime(item.lastMessageAt) }}</v-chip>
          <v-btn density="comfortable" size="small" icon="mdi-dots-horizontal" variant="text" @click.stop="null"></v-btn>
        </v-layout>
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
