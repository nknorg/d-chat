<template>
  <v-dialog activator="parent" width="600" v-model="state.dialog">
    <template v-slot:default="{ isActive }">
      <v-form fast-fail @submit.prevent="submit">
        <v-card class="pt-2">
          <v-card-title>
            <span class="text-h5">{{ $t('new_whisper') }}</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-text-field
                v-model="state.sendTo"
                :label="$t('send_to')"
                :placeholder="$t('enter_or_select_a_user_pubkey')"
                autofocus
                required
                :rules="[validator.required(), validator.isValidDchatAddress()]"
              >
                <template v-slot:append-inner>
                  <!--TODO: select user-->
                  <v-icon>mdi-clipboard-account</v-icon>
                </template>
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
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { logger, SessionSchema, SessionType } from '@d-chat/core'
import { reactive } from 'vue'
import { Wallet } from 'nkn-sdk'
import { Validator } from '@/helpers/validator'

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
          targetType: SessionType.CONTACT,
          lastMessageAt: new Date().getTime(),
          unReadCount: 0
        })
      )
    }

    await chatStore.setCurrentChatTargetId(state.sendTo)
    chatStore.currentTargetType = SessionType.CONTACT
    state.dialog = false
  }
}
</script>
