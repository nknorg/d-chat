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
                :loading="state.loading"
                :disabled="state.loading"
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
            <v-btn color="blue-darken-1" variant="text" @click="isActive.value = false" :disabled="state.loading">
              {{ $t('cancel') }}
            </v-btn>
            <v-btn color="blue-darken-1" variant="text" type="submit" :loading="state.loading" :disabled="state.loading">
              {{ $t('ok') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { Validator } from '@/helpers/validator'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { SessionSchema, SessionType } from '@d-chat/core'
import { reactive, watch } from 'vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const validator = new Validator()

const state = reactive({
  loading: false,
  dialog: false,
  sendTo: ''
})

watch(
  () => state.dialog,
  (newVal) => {
    if (newVal) {
      state.sendTo = ''
    }
  }
)

async function submit(event) {
  const results = await event
  if (results.valid) {
    state.loading = true
    try {
      await chatStore.subscribeTopic(state.sendTo)
    } catch (e) {
      state.loading = false
      state.dialog = false
      return
    }
    state.loading = false

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
    chatStore.currentTargetType = SessionType.TOPIC
    await chatStore.setCurrentChatTargetId(state.sendTo)
    state.dialog = false
  }
}
</script>
