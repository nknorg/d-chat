<template>
  <v-row v-if="props.message.payload.contentType === MessageContentType.topicSubscribe" class="align-self-center">
    <TopicSubscribe :message="props.message" />
  </v-row>
  <v-row v-else-if="props.message.payload.contentType === MessageContentType.topicUnsubscribe" class="align-self-center">
    <TopicUnsubscribe :message="props.message" />
  </v-row>
  <v-row v-else-if="!props.message.isOutbound" dense>
    <v-col cols="auto">
      <!--      TODO: use contact info-->
      <v-avatar width="200" color="primary">{{ props.message.sender.substring(0, 2) }}</v-avatar>
    </v-col>
    <v-col>
      <!-- TODO: add contact name-->
      <h4>{{ props.message.sender.substring(0, 6) }}</h4>
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
      <v-label class="body-small"> 10:30</v-label>
    </div>
  </v-alert>
</template>
<script setup lang="ts">
import { MessageContentType, MessageSchema } from '@d-chat/core'
import { defineProps } from 'vue'
import { formatChatTime } from '@/utils/format'

const props = defineProps<{
  message: MessageSchema
}>()
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
