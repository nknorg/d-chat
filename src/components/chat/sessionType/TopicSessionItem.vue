<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <v-avatar color="primary" class="relative" style="overflow: visible">
        <!--TODO: use topic info -->
        {{ item.targetId.substring(0, 2) }}
        <span style="position: absolute; top: -4px; right: -4px">
          <v-chip variant="outlined" size="14">
            <svg-icon name="group" color="#fff" :size="14" />
          </v-chip>
        </span>
      </v-avatar>
    </template>
    <template #default="{}">
      <v-list-item-title class="d-flex align-center">
        {{ item.targetId }}
      </v-list-item-title>
      <v-list-item-subtitle>
        <SessionListMessageSummary :session-item="item" />
      </v-list-item-subtitle>
    </template>
    <template #append>
      <v-layout class="flex-column justify-center align-end" style="height: 50px">
        <span class="body-regular">{{ formatChatTime(item.lastMessageAt) }}</span>
        <UnreadBadge :count="item.unReadCount" />
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
