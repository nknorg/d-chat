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
      <v-layout class="flex-column justify-space-around align-end" style="height: 50px">
        <UnreadBadge :count="item.unReadCount" />
        <span class="body-regular">{{ formatChatTime(item.lastMessageAt) }}</span>
      </v-layout>
      <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
        <v-chip color="blue" density="comfortable" size="small" variant="tonal" link @click.stop="null">
          <template #prepend>
            <Icon icon="material-symbols:groups-2-rounded" class="mr-1"></Icon>
          </template>
          <template #append>
            <span class="body-small">99</span>
          </template>
        </v-chip>
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
