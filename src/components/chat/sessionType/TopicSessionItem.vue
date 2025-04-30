<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <TopicAvatar :item="topicInfo" />
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
            <span class="body-small">{{ contactStore.contactInfoMap[key]?.data['count'] }}</span>
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
import { useContactStore } from '@/stores/contact'
import { useSessionStore } from '@/stores/session'
import { formatChatTime } from '@/utils/format'
import { SessionSchema, TopicSchema } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const contactStore = useContactStore()
const topicInfo = ref<TopicSchema>()

const props = defineProps<{
  item: SessionSchema
}>()

const key = `${props.item.targetType}-${props.item.targetId}`

onMounted(async () => {
  const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
  if (contact) {
    topicInfo.value = contact
  }
})

function selectedSession(s: SessionSchema) {
  chatStore.currentTargetId = s.targetId
  chatStore.currentTargetType = s.targetType
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}
</script>
