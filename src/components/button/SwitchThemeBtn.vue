<template>
  <v-btn :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
         @click="handleSwitchTheme"></v-btn>
</template>
<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useTheme } from 'vuetify'
import { useSettingStore } from '@/stores/setting'

const theme = useTheme()
const settingStore = useSettingStore()

onBeforeMount(async () => {
  const themeName = await settingStore.getTheme()
  theme.global.name.value = themeName ?? 'light'
})

async function handleSwitchTheme() {
  const themeName = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = themeName
  await settingStore.setTheme(themeName)
}
</script>
