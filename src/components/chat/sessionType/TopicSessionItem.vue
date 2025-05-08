<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <TopicAvatar :item="topicInfo" />
    </template>
    <template #default="{}">
      <v-list-item-title class="d-flex align-center">
        {{ item.targetId }}
      </v-list-item-title>
      <v-list-item-subtitle class="d-flex align-center">
        <SessionListMessageSummary class="text-truncate" :session-item="item" />
      </v-list-item-subtitle>
    </template>
    <template #append>
      <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
        <v-layout class="d-flex align-center">
          <UnreadBadge :count="item.unReadCount" />
          <v-chip color="blue" density="comfortable" size="small" variant="tonal" link @click.stop="syncTopicSubscribers">
            <template #prepend>
              <v-progress-circular v-if="isSyncing" class="mr-1" size="12" width="2" color="primary" indeterminate></v-progress-circular>
              <Icon v-else icon="material-symbols:groups-2-rounded" class="mr-1"></Icon>
            </template>
            <template #append>
              <span class="body-small">{{ contactStore.contactInfoMap[key]?.data['count'] }}</span>
            </template>
          </v-chip>
        </v-layout>
        <v-layout class="d-flex align-center">
          <v-chip label size="small" density="compact" variant="text">{{ formatChatTime(item.lastMessageAt) }}</v-chip>
          <v-btn density="comfortable" size="small" icon="mdi-dots-horizontal" variant="text" @click.stop="null">
            <v-menu activator="parent" transition="slide-y-transition" location="bottom" @update:model-value="checkSubscriptionStatus">
              <template #activator="{ props }">
                <v-icon v-bind="props" icon="mdi-dots-horizontal" />
              </template>
              <template #default="{ isActive }">
                <v-list>
                  <v-list-item
                    @click.stop="
                      () => {
                        isActive.value = false
                      }
                    "
                  >
                    <v-list-item-title>{{ $t('channel_members') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="!isSubscribed"
                    @click.stop="
                      () => {
                        isActive.value = false
                        handleJoin()
                      }
                    "
                  >
                    <v-list-item-title>{{ $t('join_channel') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-else
                    @click.stop="
                      () => {
                        isActive.value = false
                        handleLeave()
                      }
                    "
                  >
                    <v-list-item-title>{{ $t('leave_channel') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    class="text-pink"
                    @click.stop="
                      () => {
                        isActive.value = false
                        handleDelete()
                      }
                    "
                  >
                    <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </template>
            </v-menu>
          </v-btn>
        </v-layout>
      </v-layout>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import UnreadBadge from '@/components/chat/UnreadBadge.vue'
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { useSessionStore } from '@/stores/session'
import { useDialogStore } from '@/stores/dialog'
import { formatChatTime } from '@/utils/format'
import { logger, SessionSchema, SessionType, TopicSchema } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const contactStore = useContactStore()
const dialogStore = useDialogStore()
const topicInfo = ref<TopicSchema>()
const isSyncing = ref(false)
const isSubscribed = ref(false)

const props = defineProps<{
  item: SessionSchema
}>()

const key = `${props.item.targetType}-${props.item.targetId}`

async function checkSubscriptionStatus() {
  if (props.item.targetType === SessionType.TOPIC) {
    try {
      const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
      if (contact) {
        topicInfo.value = contact
        isSubscribed.value = contact.joined
      }
    } catch (e) {
      logger.error('Failed to check subscription status:', e)
    }
  }
}

async function handleJoin() {
  if (props.item.targetType === SessionType.TOPIC) {
    try {
      await chatStore.subscribeTopic(props.item.targetId)
      // Refresh topic info after joining
      const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
      if (contact) {
        topicInfo.value = contact
        isSubscribed.value = true
      }
    } catch (e) {
      logger.error('Failed to join topic:', e)
    }
  }
}

async function handleLeave() {
  if (props.item.targetType === SessionType.TOPIC) {
    const confirmed = await dialogStore.showConfirm({
      title: proxy.$t('warning'),
      content: proxy.$t('confirm_unsubscribe_group')
    })
    if (confirmed) {
      try {
        await chatStore.unsubscribeTopic(props.item.targetId)
        // Update subscription status
        isSubscribed.value = false
        // Refresh topic info
        const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
        if (contact) {
          topicInfo.value = contact
        }
      } catch (e) {
        logger.error('Failed to leave topic:', e)
      }
    }
  }
}

async function handleDelete() {
  if (props.item.targetType === SessionType.TOPIC) {
    const confirmed = await dialogStore.showConfirm({
      title: proxy.$t('delete_session'),
      content: proxy.$t('delete_session_confirm_title'),
      type: 'error'
    })
    if (confirmed) {
      try {
        await chatStore.deleteTopic(props.item.targetId)
        // Remove the session from the list after successful deletion
        const index = sessionStore.sessionList.findIndex(s => s.targetId === props.item.targetId)
        if (index !== -1) {
          sessionStore.sessionList.splice(index, 1)
        }
      } catch (e) {
        logger.error('Failed to delete topic:', e)
      }
    }
  }
}

onMounted(async () => {
  await checkSubscriptionStatus()
})

function selectedSession(s: SessionSchema) {
  chatStore.currentTargetId = s.targetId
  chatStore.currentTargetType = s.targetType
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}

async function syncTopicSubscribers() {
  if (props.item.targetType === SessionType.TOPIC) {
    try {
      isSyncing.value = true
      await chatStore.syncTopicSubscribers(props.item.targetId)
      // Refresh topic info after sync
      const contact = await contactStore.getContactInfo({ type: props.item.targetType, address: props.item.targetId })
      if (contact) {
        topicInfo.value = contact
      }
    } finally {
      isSyncing.value = false
    }
  }
}
</script>
