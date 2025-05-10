import { logger, StoreAdapter } from '@d-chat/core'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

export const i18n = createI18n({
  mode: 'legacy',
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages
})

// Initialize i18n
async function initI18n() {
  const locale = await StoreAdapter.localStorage.get('settings:locale')
  // @ts-ignore
  const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage]
  let browserLocale = 'en'
  for (const lang of browserLanguages) {
    if (i18n.global.availableLocales.includes(lang)) {
      browserLocale = lang
      break
    }
  }
  // @ts-ignore
  i18n.global.locale.value = locale ?? browserLocale
}

// Call init function
initI18n().catch(logger.error)
