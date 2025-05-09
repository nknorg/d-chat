<template>
  <v-alert
    class="cursor-pointer"
    :theme="theme.global.name.value"
    max-width="420"
    max-height="200"
    min-width="320"
    border="start"
    close-label="Close Alert"
    variant="elevated"
    closable
    @click:close="handleClose"
    @click="navigateToChat"
  >
    <v-row dense class="d-flex align-stretch flex-grow-0 full-height">
      <v-col cols="auto" class="flex-shrink-0">
        <v-layout>
          <ContactAvatar :address="message?.sender" class="mr-3" />
        </v-layout>
      </v-col>
      <v-col>
        <v-layout>
          <h4 class="text-truncate">{{ senderName }}</h4>
        </v-layout>
        <v-layout class="body-regular" color="primary" theme="dark">
          <MessageContent class="message-content" :message="message"></MessageContent>
        </v-layout>
      </v-col>
    </v-row>
    <div class="footer">
      <v-label class="body-small">{{ formatChatTime(message.sentAt) }}</v-label>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import ContactAvatar from '@/components/contact/ContactAvatar.vue'
import { useChatStore } from '@/stores/chat'
import { useContactStore } from '@/stores/contact'
import { useSessionStore } from '@/stores/session'
import { formatChatTime } from '@/utils/format'
import { ContactSchema, ContactService, MessageSchema, SessionType } from '@d-chat/core'
import { NotivueItem } from 'notivue'
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const contactStore = useContactStore()
const chatStore = useChatStore()
const sessionStore = useSessionStore()

const props = defineProps<{
  item: NotivueItem<{
    message: MessageSchema
  }>
}>()

const message = computed(() => props.item.props.message)
const senderName = ref('')

onMounted(async () => {
  // Get sender info
  if (message.value.sender) {
    const contact: ContactSchema = await contactStore.getContactInfo({
      type: SessionType.CONTACT,
      address: message.value.sender
    })
    senderName.value = contact?.displayName || ContactService.getNameByContact(contact)
  }
})

// Handle close event
const handleClose = () => {
  props.item.destroy()
}

const navigateToChat = () => {
  if (message.value.sender) {
    chatStore.currentTargetType = message.value.targetType
    chatStore.setCurrentChatTargetId(message.value.targetId)
    sessionStore.readAllMessagesByTargetId(message.value.targetId, message.value.targetType)
  }
  handleClose()
}
</script>

<style scoped>
.message-content {
  --line-height: 1.5em;
  max-height: calc(var(--line-height) * 4);
  line-height: var(--line-height);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  word-break: break-word;
}
</style>
