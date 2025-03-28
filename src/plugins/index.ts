/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'
import { i18n } from './i18n'
import { notivue } from './notivue'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  app.use(i18n)
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(notivue)
}
