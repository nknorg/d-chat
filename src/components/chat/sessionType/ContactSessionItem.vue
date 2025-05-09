<template>
  <v-list-item :active="chatStore.currentTargetId == props.item.targetId" @click="selectedSession(item)">
    <template #prepend>
      <ContactAvatar :item="contactInfo" />
    </template>
    <template #default="{}">
      <v-list-item-title class="d-flex align-center">
        <template v-if="contactInfo">
          {{ contactInfo.displayName ?? ContactService.getNameByContact(contactInfo) }}
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
          <v-btn density="comfortable" size="small" icon variant="text">
            <v-menu activator="parent" transition="slide-y-transition" location="bottom">
              <template #activator="{ props }">
                <v-icon v-bind="props" icon="mdi-dots-horizontal" />
              </template>
              <template #default="{ isActive }">
                <v-list>
                  <v-list-item
                    @click.stop="
                      () => {
                        isActive.value = false
                        showProfile = true
                      }
                    "
                  >
                    <v-list-item-title>{{ $t('profile') }}</v-list-item-title>
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
      <ContactProfile v-model="showProfile" :contact="contactInfo" />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import UnreadBadge from '@/components/chat/UnreadBadge.vue'
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { useDialogStore } from '@/stores/dialog'
import { useSessionStore } from '@/stores/session'
import { formatChatTime } from '@/utils/format'
import { ContactSchema, ContactService, logger, SessionSchema } from '@d-chat/core'
import { getCurrentInstance, onMounted, ref } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const contactStore = useContactStore()
const dialogStore = useDialogStore()
const contactInfo = ref<ContactSchema>()
const showProfile = ref(false)
const ins = getCurrentInstance()
const proxy = ins!.proxy!

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
  chatStore.currentTargetType = s.targetType
  chatStore.setCurrentChatTargetId(s.targetId)
  sessionStore.readAllMessagesByTargetId(s.targetId, s.targetType)
}

async function handleDelete() {
  const result = await dialogStore.showConfirm({
    title: proxy.$t('delete_session'),
    content: proxy.$t('delete_session_confirm_title'),
    type: 'error'
  })
  if (result) {
    await deleteSession()
  }
}

async function deleteSession() {
  try {
    await chatStore.deleteSession(props.item.targetId, props.item.targetType)
    // Remove from session list
    const index = sessionStore.sessionList.findIndex((s) => s.targetId === props.item.targetId && s.targetType === props.item.targetType)
    if (index !== -1) {
      sessionStore.sessionList.splice(index, 1)
    }
  } catch (error) {
    logger.error('Failed to delete session:', error)
  }
}
</script>
