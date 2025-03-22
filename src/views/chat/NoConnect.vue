<template>
  <v-container class="fill-height">
    <v-layout class="flex-column">
      <v-row>
        <v-col align="center">
          {{ $t('chat_no_messages_title') }}
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <v-label>{{ $t('click_connect') }}</v-label>
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <v-select
            v-model="state.selectedWallet"
            :items="walletStore.wallets"
            item-value="address"
            item-title="name"
            single-line
          >
            <template #selection="{ item, index }">
              {{ item.title }}
            </template>
            <template #item="{props, item }">
              <v-list-item v-bind="props" @click="onSelect(item.value)" @on-click-once="onSelect(item.value)"
                           :title="item.title">
                <v-list-item-subtitle>
                  {{ item.value }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <v-text-field
            :label="$t('password')"
            v-model="state.password"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <v-btn color="primary" @click="connect">{{ $t('connect') }}</v-btn>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>


<script lang="ts" setup>
import {useClientStore} from '../../stores/client'
import { useCommonStore } from '../../stores/common'
import { useContactStore } from '../../stores/contact'
import {useDbStore} from '../../stores/db'
import { useSessionStore } from '../../stores/session'
import {useWalletStore} from '../../stores/wallet'

import {ComponentPublicInstance, getCurrentInstance, onBeforeMount, reactive} from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const walletStore = useWalletStore()
const clientStore = useClientStore()
const contactStore = useContactStore()
const dbStore = useDbStore()
const sessionStore = useSessionStore()
const commonStore = useCommonStore()

const state = reactive({
  wallets: [],
  selectedWallet: null,
  password: '',
})

onBeforeMount(async () => {
  if (walletStore.wallets == null || (walletStore.wallets as []).length == 0) {
    proxy.$router.push('/wallet/no_wallet')
    return
  }

  state.selectedWallet = await walletStore.getDefault()
})

async function onSelect(v: any) {
  state.selectedWallet = v
  await walletStore.setDefault(v)
}

async function connect() {
  if (state.selectedWallet == null) return
  const {keystore} = await walletStore.get(state.selectedWallet)
  const {publicKey, seed} = await walletStore.restoreNknWallet(keystore, state.password)
  await dbStore.openDb(publicKey, seed)
  await clientStore.connect(seed)
  await sessionStore.queryListRecent(20, 0)
}

</script>
