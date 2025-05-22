<template>
  <v-row v-if="props.message.payload.contentType === MessageContentType.topicSubscribe" class="align-self-center flex-grow-0">
    <v-col class="pa-0">
      <TopicSubscribe :message="props.message" />
    </v-col>
  </v-row>
  <v-row v-else-if="props.message.payload.contentType === MessageContentType.topicUnsubscribe" class="align-self-center flex-grow-0">
    <TopicUnsubscribe :message="props.message" />
  </v-row>
  <v-row v-else-if="!props.message.isOutbound" dense class="flex-grow-0">
    <v-col cols="auto">
      <v-layout class="cursor-pointer">
        <ContactAvatar :item="contactInfo"></ContactAvatar>
        <ContactProfile :activator="'parent'" :contact="contactInfo" />
      </v-layout>
    </v-col>
    <v-col>
      <v-layout class="cursor-pointer">
        <h4>{{ contactInfo?.displayName || ContactService.getNameByContact(contactInfo) }}</h4>
        <ContactProfile :activator="'parent'" :contact="contactInfo" />
      </v-layout>
      <v-alert class="alert target-alert body-regular" color="grey-darken-3" theme="dark" prominent>
        <MessageContent :message="props.message" />
        <div v-if="state.translateExpanded">
          <v-row>
            <v-col class="align-self-center">
              <v-divider />
            </v-col>
            <v-col cols="auto pr-0">
              <v-chip size="small" variant="tonal" density="compact">
                {{ $t('translate') }}
              </v-chip>
            </v-col>
            <v-col class="align-self-center">
              <v-divider />
            </v-col>
          </v-row>
          <div>
            {{ state.translateResult }}
          </div>
        </div>
        <div class="footer">
          <v-label class="body-small">{{ formatChatTime(props.message.sentAt) }}</v-label>
        </div>
        <div class="tools">
          <v-btn v-if="state.hasTranslator" :loading="state.translateLoading" icon variant="plain" density="compact" @click="translate(props.message.payload.content)">
            <Icon icon="bi:translate" />
          </v-btn>
        </div>
      </v-alert>
    </v-col>
  </v-row>
  <v-alert v-else-if="props.message.isOutbound" class="alert self-alert body-regular" color="primary" theme="dark" prominent>
    <MessageContent :message="props.message" />
    <div class="footer">
      <v-label class="body-small">{{ formatChatTime(props.message.sentAt) }}</v-label>
      <div class="check-icons">
        <Icon
          v-if="props.message.status & MessageStatus.Sent"
          class="check-icon"
          :icon="props.message.status & MessageStatus.Read ? 'material-symbols:check-circle-rounded' : 'material-symbols:check-circle-outline-rounded'"
        />
        <div v-if="props.message.status & MessageStatus.Receipt" class="check-icon-wrapper">
          <v-avatar size="16" color="primary">
            <Icon
              class="check-icon"
              :icon="props.message.status & MessageStatus.Read ? 'material-symbols:check-circle-rounded' : 'material-symbols:check-circle-outline-rounded'"
            />
          </v-avatar>
        </div>
      </div>
    </div>
  </v-alert>
</template>
<script setup lang="ts">
import { AiTranslator } from '@/ai/translator'
import { MessageContentType, MessageSchema, SessionType, ContactSchema, ContactService, MessageStatus } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { defineProps, ref, onMounted, reactive } from 'vue'
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

const translator: AiTranslator | null = AiTranslator.getInstance()
const state = reactive<{
  hasTranslator: boolean
  translateExpanded: boolean
  translateResult: string | null
  translateLoading: boolean
}>({
  hasTranslator: translator !== null,
  translateExpanded: false,
  translateResult: null,
  translateLoading: false
})

async function translate(text: string) {
  if (translator) {
    state.translateLoading = true
    state.translateResult = await translator.translate(text)
    if (state.translateResult) {
      state.translateExpanded = true
    }
    state.translateLoading = false
  }
}
</script>
<style lang="scss">
.alert {
  flex-grow: 0 !important;
  overflow: unset !important;
  width: fit-content;
  padding-bottom: 8px;
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
  align-items: center;
}

.tools {
  display: flex;
  justify-content: end;
  align-items: center;
}

.check-icons {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
  width: auto;
  height: 16px;
}

.check-icons:has(.check-icon-wrapper) {
  width: 24px;
}

.check-icon {
  font-size: 14px;
  color: white;
}

.check-icon-wrapper {
  position: absolute;
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
