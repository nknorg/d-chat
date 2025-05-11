// Plugins
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import Fonts from 'unplugin-fonts/vite'
import Components from 'unplugin-vue-components/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Utilities
import { defineConfig, loadEnv } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vuetify from 'vite-plugin-vuetify'

import packageJson from './package.json' with { type: 'json' }

const IS_DEV = process.env.NODE_ENV === 'development'
const PORT = Number(process.env.PORT) || 3303

// https://vitejs.dev/config/
export default defineConfig({
  base: IS_DEV ? `/` : '',
  build: {
    watch: IS_DEV ? {} : undefined,
    sourcemap: IS_DEV ? 'inline' : false
  },

  legacy: {
    // ⚠️ SECURITY RISK: Allows WebSockets to connect to the vite server without a token check ⚠️
    // See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
    // The linked issue gives a potential fix that @crxjs/vite-plugin could implement
    skipWebSocketTokenCheck: true
  },
  plugins: [
    {
      name: 'inject-meta',
      transformIndexHtml(html) {
        const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd())
        return html.replace(
          /<head>/,
          `<head>
  <meta http-equiv="origin-trial" content="${env.VITE_WEB_META_ORIGIN_TRIAL}" />`
        )
      }
    },
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    }),
    Components({
      dts: 'src/types/components.d.ts'
    }),
    VueI18nPlugin({
      include: 'src/locales/**',
      globalSFCScope: true,
      compositionOnly: true
    }),
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    }),
    Fonts({
      // google: {
      //   families: [{
      //     name: 'Roboto',
      //     styles: 'wght@100;300;400;500;700;900'
      //   }]
      // }
    }),
    createSvgIconsPlugin({
      // Specify the icon folder to be cached
      iconDirs: [resolve(__dirname, 'assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  define: {
    'process.env': {
      __APP_PLATFORM__: 'web',
      __VERSION__: packageJson.version
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': resolve(__dirname, 'assets')
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    port: PORT,
    hmr: {
      host: 'localhost'
    }
  }
})
