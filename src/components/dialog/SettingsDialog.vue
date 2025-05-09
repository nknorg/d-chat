<template>
  <v-dialog v-model="state.dialog" activator="parent" transition="dialog-bottom-transition" fullscreen>
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="state.dialog = false"></v-btn>
        <v-toolbar-title>{{ $t('settings') }}</v-toolbar-title>
        <v-toolbar-items>
          <v-btn :text="$t('done')" variant="text" @click="done"></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container>
        <v-card variant="outlined">
          <v-card-title>{{ $t('my_account') }}</v-card-title>
          <v-card-text>
            <v-menu>
              <template #activator="{ props }">
                <v-card v-if="state.selectedWallet" elevation="0" v-bind="props" class="mx-auto">
                  <template #default>
                    <v-btn class="justify-start text-start" height="80" block variant="tonal" v-bind="props">
                      <template #prepend>
                        <v-avatar size="60">
                          <Icon icon="material-symbols:account-balance-wallet-outline" width="60" height="60" />
                        </v-avatar>
                      </template>
                      <v-list class="bg-transparent">
                        <v-list-item lines="three">
                          <v-list-item-title class="justify-start align-start">{{ state.selectedWallet.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ state.selectedWallet.address }}</v-list-item-subtitle>
                          <v-list-item-subtitle>{{ state.selectedWallet.publicKey }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-btn>
                  </template>
                </v-card>
                <v-card v-else elevation="0" v-bind="props" class="mx-auto" :title="$t('select_wallet')" :subtitle="$t('click_to_select_wallet')">
                  <template #prepend>
                    <v-avatar size="60">
                      <Icon icon="material-symbols:account-balance-wallet-outline" width="60" height="60" />
                    </v-avatar>
                  </template>
                </v-card>
              </template>

              <v-card min-width="300">
                <v-list lines="two">
                  <v-list-item
                    v-for="wallet in state.wallets"
                    :key="wallet.address"
                    :active="state.selectedWallet?.address === wallet.address"
                    @click="state.selectedWallet = wallet"
                  >
                    <template #prepend>
                      <v-avatar size="40">
                        <Icon icon="material-symbols:account-balance-wallet-outline" width="40" height="40" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="justify-start align-start">{{ wallet.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ wallet.address }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ wallet.publicKey }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
            <v-btn color="primary" block class="mt-4" :loading="state.exporting" :disabled="!state.selectedWallet" @click="exportWallet">
              {{ $t('export_wallet') }}
            </v-btn>
          </v-card-text>
          <v-divider class="mt-4"></v-divider>

          <v-card-title>{{ $t('general') }}</v-card-title>
          <v-card-text>
            <v-menu>
              <template #activator="{ props }">
                <v-btn block variant="tonal" v-bind="props"> {{ $t('language') }}: {{ $rt(state.lang.lang) }}</v-btn>
              </template>

              <v-list>
                <v-list-item v-for="(item, i) in state.locales" :key="i" :value="item.code" @click="onChangeSwitchLanguage(item)">
                  <v-list-item-title>{{ $rt(item.lang) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-text>
          <v-divider class="mt-4"></v-divider>

          <v-card variant="flat">
            <v-card-title>{{ $t('notification') }}</v-card-title>
            <v-card-text>
              <v-switch v-model="state.enableNotifications" :label="$t('remote_notification')" @change="onNotificationChange"></v-switch>
              <v-switch
                v-model="state.enableNotificationSound"
                :label="$t('notification_sound')"
                @change="onNotificationSoundChange"
                :disabled="!state.enableNotifications"
              ></v-switch>
            </v-card-text>
          </v-card>
        </v-card>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification'
import { useSettingStore } from '@/stores/setting'
import { useWalletStore } from '@/stores/wallet'
import { WalletRecord } from '@d-chat/core'
import { Icon } from '@iconify/vue'
import { ComponentPublicInstance, getCurrentInstance, onBeforeMount, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const settingStore = useSettingStore()
const walletStore = useWalletStore()
const notificationStore = useNotificationStore()

const locales: any = []
let lang = {}
const { messages, availableLocales } = useI18n()

for (const key of availableLocales) {
  const locale = { code: key, lang: messages.value[key]['@@language'] }
  locales.push(locale)
  if (key == ins?.proxy?.$i18n.locale) {
    lang = locale
  }
}

interface State {
  dialog: boolean
  lang: any
  locales: any[]
  enableNotifications: boolean
  enableNotificationSound: boolean
  exporting: boolean
  selectedWallet: WalletRecord | null
  wallets: WalletRecord[]
}

const state = reactive<State>({
  dialog: false,
  lang: lang,
  locales: locales,
  enableNotifications: false,
  enableNotificationSound: false,
  exporting: false,
  selectedWallet: null,
  wallets: []
})

async function loadSettings() {
  state.enableNotifications = await settingStore.getEnableNotification()
  state.enableNotificationSound = await settingStore.getEnableNotificationSound()
}

onBeforeMount(async () => {
  const wallets = await walletStore.getAll()
  state.wallets = wallets
  const defaultWallet = await walletStore.getDefault()
  state.selectedWallet = defaultWallet
  await loadSettings()
})

async function onChangeSwitchLanguage(event: any) {
  proxy.$i18n.locale = event.code
  state.lang = event
  await settingStore.setLocale(event.code)
}

async function onNotificationChange(event: any) {
  const value = event.target.checked
  state.enableNotifications = value
  await settingStore.setEnableNotification(value)
  if (!value) {
    state.enableNotificationSound = false
    await settingStore.setEnableNotificationSound(false)
  }
}

async function onNotificationSoundChange(event: any) {
  const value = event.target.checked
  state.enableNotificationSound = value
  await settingStore.setEnableNotificationSound(value)
}

async function exportWallet() {
  try {
    state.exporting = true
    if (!state.selectedWallet) {
      throw new Error(proxy.$t('wallet_missing'))
    }
    const blob = new Blob([JSON.stringify(state.selectedWallet.keystore, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wallet-${state.selectedWallet.address}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notificationStore.success({
      title: proxy.$t('success'),
      message: proxy.$t('wallet_exported')
    })
  } catch (error) {
    notificationStore.error({
      title: proxy.$t('error'),
      message: error.message
    })
  } finally {
    state.exporting = false
  }
}

function done() {
  state.dialog = false
}
</script>
