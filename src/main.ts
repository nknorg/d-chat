/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import SvgIcon from "./components/SvgIcon.vue";
import 'virtual:svg-icons-register'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)
// app.use(pinia)
app.component('svg-icon', SvgIcon)
app.mount('#app')
