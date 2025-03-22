import { application } from '@/common/application'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

export const i18n = createI18n({
  mode: 'legacy',
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages
})

const locale = await application.localStorage.get('settings:locale')

const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage]
let browserLocale = 'en'
for (const lang of browserLanguages) {
  if (i18n.global.availableLocales.includes(lang)) {
    browserLocale = lang
    break
  }
}

i18n.global.locale.value = locale ?? browserLocale
