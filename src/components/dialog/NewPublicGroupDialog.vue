<template>
  <v-dialog activator="parent" width="600" v-model="state.dialog">
    <template v-slot:default="{ isActive }">
      <v-form fast-fail @submit.prevent="submit">
        <v-card class="pt-2">
          <v-card-title>
            <span class="text-h5">{{ $t('create_channel') }}</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-text-field
                v-model="state.sendTo"
                :label="$t('send_to')"
                :placeholder="$t('enter_topic')"
                autofocus
                required
                :rules="[validator.required()]"
              >
              </v-text-field>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="isActive.value = false">
              {{ $t('cancel') }}
            </v-btn>
            <v-btn color="blue-darken-1" variant="text" type="submit">
              {{ $t('ok') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { Validator } from '@/helpers/validator'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { SessionSchema, SessionType } from '@d-chat/core'
import { reactive } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const validator = new Validator()

const state = reactive({
  dialog: false,
  sendTo: ''
})

async function submit(event) {
  const results = await event
  if (results.valid) {
    if (!sessionStore.sessionList.find((session) => session.targetId === state.sendTo)) {
      sessionStore.sessionList.unshift(
        new SessionSchema({
          isTop: false,
          lastMessageOutbound: true,
          targetId: state.sendTo,
          targetType: SessionType.TOPIC,
          lastMessageAt: new Date().getTime(),
          unReadCount: 0
        })
      )
    }

    await chatStore.setCurrentChatTargetId(state.sendTo)
    chatStore.currentTargetType = SessionType.TOPIC

    application.service.call(ServiceType.dchat, 'getTopicSubscribers', state.sendTo)

    state.dialog = false
  }
}
</script>
