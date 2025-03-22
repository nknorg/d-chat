import {defineConfig, externalizeDepsPlugin} from 'electron-vite'
import {resolve} from 'path'
import baseConfig from './vite.config'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts'),
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts'),
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    ...baseConfig,
    root: '.',
    define:{
      ...baseConfig.define,
      __APP_PLATFORM__: JSON.stringify('electron')
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
  },
})
