<template>
  <Splash v-if="application.loading.value" />
  <router-view v-else />
</template>

<script lang="ts" setup>
import { application } from '@/common/application'
import { useClientStore } from '@/stores/client'
import { useWalletStore } from '@/stores/wallet'
import { ComponentPublicInstance, getCurrentInstance, onBeforeMount } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingStore } from './stores/setting'

const settingStore = useSettingStore()
const clientStore = useClientStore()
const walletStore = useWalletStore()
const theme = useTheme()

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

onBeforeMount(async () => {
  await application.initialize()
  await walletStore.getAll()

  const themeName: string = (await settingStore.getTheme()) as string
  theme.global.name.value = themeName ?? 'light'
  if (clientStore.lastSignInId !== null) {
    proxy.$router.push({ path: '/chat' })
  }
})
</script>
