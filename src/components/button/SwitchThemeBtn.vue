<template>
  <v-btn
    :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    @click="handleSwitchTheme"
  ></v-btn>
</template>
<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting'
import { useTheme } from 'vuetify'

const theme = useTheme()
const settingStore = useSettingStore()

async function handleSwitchTheme() {
  const themeName = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = themeName
  await settingStore.setTheme(themeName)
}
</script>
