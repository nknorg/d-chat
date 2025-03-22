<template>
  <Splash v-if="application.loading" />
  <router-view v-else />
</template>

<script lang="ts" setup>
import { application } from '@/common/application'
import { useCommonStore } from './stores/common'
import { useSettingStore } from './stores/setting'

const commonStore = useCommonStore()
const settingStore = useSettingStore()
import { ComponentPublicInstance, getCurrentInstance, onBeforeMount } from 'vue'

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!


onBeforeMount(async () => {
  await application.initialize()
  commonStore.getVersions()
})
</script>
