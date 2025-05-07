/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from './plugins'

// Composables
import { createApp } from 'vue'

// Components
import App from './App.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import 'virtual:svg-icons-register'

const app = createApp(App)

registerPlugins(app)

app.component('svg-icon', SvgIcon)
app.mount('#app')
