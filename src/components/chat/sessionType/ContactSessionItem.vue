<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <v-avatar color="primary">
        <!--TODO: use contact info -->
        {{ item.targetId.substring(0, 2) }}
      </v-avatar>
    </template>
    <template #default="{}">
      <v-list-item-title>{{ item.targetId.substring(0, 6) }}</v-list-item-title>
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
import { formatChatTime } from '@/utils/format'
import { SessionSchema } from '@d-chat/core'
import { Icon } from '@iconify/vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const props = defineProps<{
  item: SessionSchema
}>()

function selectedSession(s: SessionSchema) {
  chatStore.currentTargetId = s.targetId
  chatStore.currentTargetType = s.targetType
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}
</script>
