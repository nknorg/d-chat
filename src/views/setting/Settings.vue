<template>
  <v-container>
    <v-select class="nav-item select-language"
              @update:model-value="onChangeSwitchLanguage"
              v-model="state.lang"
              :items="state.locales"
              item-title="lang"
              item-value="code"
              :label="$t('language')"
              solo dark
              return-object
    >
    </v-select>
    <v-text-field
      v-model="commonStore.versions['name']"
      :label="$t('name')"
      readonly
    ></v-text-field>
    <v-text-field
      v-model="commonStore.versions['version']"
      :label="$t('version')"
      readonly
    ></v-text-field>

  </v-container>
</template>

<script lang="ts" setup>
import en from '../../locales/en.json'
import zh from '../../locales/zh-CN.json'
import zhTW from '../../locales/zh-TW.json'
import {ComponentPublicInstance, getCurrentInstance, reactive} from 'vue'
import {useCommonStore} from '../../stores/common'
import {useSettingStore} from '../../stores/setting'
const commonStore = useCommonStore()
const settingStore = useSettingStore()

const ins = getCurrentInstance()
const proxy: ComponentPublicInstance = ins!.proxy!
const messages: any = {en, zh, zhTW}
const locales: any = []
let lang = {}
for (const key in messages) {
  const locale = {code: key, lang: messages[key]['@@language']}
  locales.push(locale)
  if (key == ins?.proxy?.$i18n.locale) {
    lang = locale
  }
}

const state = reactive({
  lang: lang,
  locales: locales,
})

function onChangeSwitchLanguage(event: any) {
  proxy.$i18n.locale = event.code
  settingStore.setLocale(proxy.$i18n.locale)
}
</script>
