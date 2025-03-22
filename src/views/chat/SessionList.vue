<template>
  <v-navigation-drawer
    theme="dark"
    rail
    permanent
  >
    <v-list-item @click="state.showProfileDialog = true"
      nav
    >
      <Avatar :address="contactStore.me?.address"
              :name="getNickName(contactStore.me)"
              :avatar-bg-color="contactStore.me?.options?.avatarBgColor"
              :avatar-fg-color="contactStore.me?.options.avatarFgColor" />
    </v-list-item>

    <v-divider></v-divider>

    <v-list
      density="compact"
      nav
    >
      <v-menu location="end" offset="8">
        <template v-slot:activator="{ props }">
          <v-list-item prepend-icon="mdi-plus" value="add" v-bind="props"></v-list-item>
        </template>
        <v-list theme="light">
          <v-list-item @click="showNewWhisperDialog">{{ $t('new_whisper') }}</v-list-item>
          <v-list-item @click="showPrivateGroupDialog">{{ $t('create_private_group') }}</v-list-item>
          <v-list-item @click="showCreateChannelDialog">{{ $t('create_channel') }}</v-list-item>
        </v-list>
      </v-menu>
      <v-list-item prepend-icon="mdi-forum" value="messages"></v-list-item>
      <v-list-item prepend-icon="mdi-view-dashboard" value="dashboard"></v-list-item>
      <v-list-item class="align-self-auto" @click="disconnect">
        <v-icon icon="mdi-power" color="red"/>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-app style="margin-bottom: -60px">
    <v-card style="height: 100%; margin-bottom: 60px">
      <v-navigation-drawer permanent width="340">
        <v-list select-strategy="single-leaf" lines="two">
          <template v-for="(item, key, index) in sessionStore.sessionList">

            <v-list-item :value="key" @click="clickSession(item, key)" :active="state.selectedItem == key">
              <template v-slot:prepend>
                <v-avatar image="https://randomuser.me/api/portraits/women/77.jpg">
                  <v-icon color="white"></v-icon>
                </v-avatar>
              </template>
              <template v-slot:default="{}">
                <v-list-item-title>
                  {{ item.targetId }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="getMessageContentType(item.lastMessageRaw) == MessageContentType.image"><svg-icon name="image" :size="18" /></span>
                  <span v-else>{{ getMessage(item.lastMessageRaw) }}</span>
                </v-list-item-subtitle>
              </template>
              <template v-slot:append class="fill-height">
                <v-layout class="flex-column justify-space-between align-end" style="height: 50px">
                  <span>{{ formatChatTime(item.lastMessageAt) }}</span>
                  <v-badge v-show="item.unReadCount > 0" inline color="primary"
                           :content="getUnReadCount(item.unReadCount)" />
                </v-layout>
              </template>
            </v-list-item>
            <v-divider
              v-if="index + 1 < sessionStore.sessionList.length"
              :key="index"
            ></v-divider>
          </template>
        </v-list>
      </v-navigation-drawer>
      <v-main class="fill-height pb-1">
        <ChatContainer :target-id="state.targetId" :type="state.type" />
      </v-main>
    </v-card>

  </v-app>


  <v-dialog
    v-model="state.newWhisperDialog"
    persistent
    width="600"
  >
    <v-card class="pt-2">
      <v-card-title>
        <span class="text-h5">{{ $t('new_whisper') }}</span>
      </v-card-title>
      <v-card-text>

        <v-row>
          <v-text-field
            v-model="state.sendTo"
            @keydown.enter="newWhisper"
            :label="$t('send_to')"
            :placeholder="$t('enter_or_select_a_user_pubkey')"
            autofocus
            required
          ></v-text-field>
        </v-row>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="state.newWhisperDialog = false"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="newWhisper"
        >
          {{ $t('ok') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="state.createChannelDialog"
    persistent
    width="600"
  >
    <v-card class="pt-2">
      <v-card-title>
        <span class="text-h5">{{ $t('create_channel') }}</span>
      </v-card-title>
      <v-card-text>

        <v-row>
          <v-text-field
            v-model="state.topic"
            @keydown.enter="createChannel"
            :label="$t('name')"
            :placeholder="$t('input_name')"
            autofocus
            required
          ></v-text-field>
        </v-row>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="state.createChannelDialog = false"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="createChannel"
        >
          {{ $t('ok') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <Profile v-model="state.showProfileDialog" :target-id="state.lastSignInCode" />
</template>


<script lang="ts" setup>
import { ContactSchema } from '../../../../schema/contact'
import { MessageContentType } from '../../../../schema/messageEnum'
import { SessionType } from '../../../../schema/sessionEnum'
import { getNickName } from '../../../../util/contact'
import { formatChatTime } from '../../../../util/format'
import ChatContainer from '../../components/chat/ChatContainer.vue'
import Avatar from '../../components/contact/Avatar.vue'
import contact from '../../router/contact'
import { useChatStore } from '../../stores/chat'
import { useClientStore } from '../../stores/client'
import { useContactStore } from '../../stores/contact'
import { useSessionStore } from '../../stores/session'
import { useWalletStore } from '../../stores/wallet'

import { ComponentPublicInstance, computed, getCurrentInstance, onBeforeMount, reactive } from 'vue'
import Profile from '../contact/Profile.vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()
const sessionStore = useSessionStore()
const clientStore = useClientStore()
const contactStore = useContactStore()

const state = reactive<{
  showProfileDialog: boolean,
  selectedItem: string | null,
  lastSignInCode: string,
  targetId: string | null,
  type: SessionType | null,
  newWhisperDialog: boolean,
  createChannelDialog: boolean,
  sendTo: string,
  topic: string
}>({
  showProfileDialog: false,
  selectedItem: null,
  lastSignInCode: clientStore.lastSignInCode,
  targetId: null,
  type: null,
  newWhisperDialog: false,
  createChannelDialog: false,
  sendTo: '',
  topic: ''
})

onBeforeMount(async () => {
  await sessionStore.queryListRecent(20, 0)
  const chatStore = useChatStore()
  await chatStore.getCurrentChatTargetId()
  state.targetId = chatStore.targetId
  contactStore.me = await contactStore.queryContactByAddress(clientStore.lastSignInCode)
})

function getMessage(raw: string) {
  const m = JSON.parse(raw)
  return m.content
}

function getMessageContentType(raw: string) {
  const m = JSON.parse(raw)
  return m.type
}

function getUnReadCount(n: number) {
  if (n == 0) {
    return ''
  } else if (n > 99) {
    return '99+'
  }
  return n
}

function disconnect() {
  const clientStore = useClientStore()
  clientStore.disconnect()
}

function clickSession(s, index) {
  state.selectedItem = index
  state.targetId = s.targetId
  state.type = s.type
  sessionStore.clearUnread(s.targetId, s.type)
}

function showNewWhisperDialog() {
  state.newWhisperDialog = true
}

function newWhisper() {
  state.newWhisperDialog = false
  state.selectedItem = null
  state.targetId = state.sendTo
  state.type = SessionType.CONTACT
  state.sendTo = ''
}

function showPrivateGroupDialog() {

}

function showCreateChannelDialog() {
  state.createChannelDialog = true
}

function createChannel() {
  state.createChannelDialog = false
  state.selectedItem = null
  state.targetId = state.topic
  state.type = SessionType.TOPIC
  state.topic = ''
  // subscription topic
  const chatStore = useChatStore()
  chatStore.subscribe(state.topic, {})
}

</script>
