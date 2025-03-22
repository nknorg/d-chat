<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-web" variant="text" v-bind="props"></v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="(item, i) in state.locales"
        :key="i"
        :value="item.code"
      >
        <v-list-item-title @click="onChangeSwitchLanguage(item)">{{ $rt(item.lang) }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'
import { ComponentPublicInstance, getCurrentInstance, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const settingStore = useSettingStore()

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!

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

const state = reactive({
  lang: lang,
  locales: locales
})

async function onChangeSwitchLanguage(event: any) {
  proxy.$i18n.locale = event.code
  await settingStore.setLocale(event.code)
}
</script>
