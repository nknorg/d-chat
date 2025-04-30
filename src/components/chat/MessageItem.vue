<template>
  <v-row v-if="props.message.payload.contentType === MessageContentType.topicSubscribe" class="align-self-center">
    <v-col class="pa-0">
      <TopicSubscribe :message="props.message" />
    </v-col>
  </v-row>
  <v-row v-else-if="props.message.payload.contentType === MessageContentType.topicUnsubscribe" class="align-self-center">
    <TopicUnsubscribe :message="props.message" />
  </v-row>
  <v-row v-else-if="!props.message.isOutbound" dense>
    <v-col cols="auto">
      <ContactAvatar :item="contactInfo" />
    </v-col>
    <v-col>
      <h4>{{ contactInfo?.displayName || ContactService.getDefaultNickName(props.message.sender) }}</h4>
      <v-alert class="alert target-alert body-regular" color="primary" theme="dark" prominent style="flex: auto">
        <MessageContent :message="props.message" />
        <div class="footer">
          <v-label class="body-small">{{ formatChatTime(props.message.sentAt) }}</v-label>
        </div>
      </v-alert>
    </v-col>
  </v-row>
  <v-alert v-else-if="props.message.isOutbound" class="alert self-alert body-regular" color="green" theme="dark" prominent style="flex: auto">
    <MessageContent :message="props.message" />
    <div class="footer">
      <v-label class="body-small">{{ formatChatTime(props.message.sentAt) }}</v-label>
    </div>
  </v-alert>
</template>
<script setup lang="ts">
import { MessageContentType, MessageSchema, SessionType, ContactSchema, ContactService } from '@d-chat/core'
import { defineProps, ref, onMounted } from 'vue'
import { formatChatTime } from '@/utils/format'
import { useContactStore } from '@/stores/contact'
import ContactAvatar from '../contact/ContactAvatar.vue'

const props = defineProps<{
  message: MessageSchema
}>()

const contactStore = useContactStore()
const contactInfo = ref<ContactSchema>()

onMounted(async () => {
  if (!props.message.isOutbound) {
    const contact = await contactStore.getContactInfo({
      type: SessionType.CONTACT,
      address: props.message.sender
    })
    if (contact) {
      contactInfo.value = contact
    }
  }
})
</script>
<style>
.alert {
  flex-grow: 0 !important;
  overflow: unset !important;
  /*min-height: 50px !important;*/
}

.target-alert {
  border-radius: 10px !important;
  border-top-left-radius: 0 !important;
}

.self-alert {
  align-self: end;
  border-radius: 10px !important;
  border-bottom-right-radius: 0 !important;
}

.footer {
  display: flex;
  justify-content: end;
}
</style>
