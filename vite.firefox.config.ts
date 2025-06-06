import { crx } from '@crxjs/vite-plugin'
import fs from 'node:fs'
import { defineConfig, mergeConfig, UserConfig, PluginOption } from 'vite'
import zipPack from 'vite-plugin-zip-pack'
import manifest from './manifest.firefox.config'
import packageJson from './package.json' with { type: 'json' }
import baseConfig from './vite.config'
import chalk from 'chalk'

const IS_DEV = process.env.NODE_ENV === 'development'
const browser = 'firefox'
const outDir = 'dist-webext'
const browserOutDir = `${outDir}/${browser}`
const outFileName = `${browser}-${packageJson.version}.zip`

const printMessage = (isDev: boolean): void => {
  setTimeout(() => {
    console.info('\n')
    console.info(chalk.greenBright(`✅ Successfully built for ${browser}.`))
    if (isDev) {
      console.info(
        chalk.greenBright(
          `🚀 Load the extension via ${browser}://extensions/, enable "Developer mode", click "Load unpacked", and select the directory:`
        )
      )
      console.info(chalk.greenBright(`📂 ${browserOutDir}`))
    } else {
      console.info(chalk.greenBright(`📦 Zip File: ${outDir}/${outFileName} (Upload to the store)`))
      console.info(chalk.greenBright(`🚀 Load manually from ${browserOutDir}`))
    }
    console.info('\n')
  }, 50)
}

// Create build message plugin
const createBuildMessagePlugin = (isDev: boolean): PluginOption => ({
  name: 'vite-plugin-build-message',
  enforce: 'post' as const,
  ...(isDev
    ? {
        configureServer(server) {
          server.httpServer?.once('listening', () => printMessage(true))
        }
      }
    : {}),
  closeBundle: { sequential: true, handler: () => printMessage(isDev) }
})

// Define browser-specific configuration
export default defineConfig(() => {
  // Create plugins based on environment
  const browserPlugins: PluginOption[] = [
    {
      name: 'ensure-output-dir',
      buildStart() {
        ;['dist/firefox'].forEach((dir) => {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        })
      }
    },
    crx({
      manifest,
      browser,
      contentScripts: { injectCss: true }
    }),
    createBuildMessagePlugin(IS_DEV)
  ]

  // Add zip plugin for production builds
  if (!IS_DEV) {
    browserPlugins.push(
      zipPack({
        inDir: browserOutDir,
        outDir,
        outFileName,
        filter: (_, filePath, isDirectory) => !(isDirectory && filePath.includes('.vite'))
      }) as PluginOption
    )
  }

  // Create browser-specific config
  const browserConfig: UserConfig = {
    build: {
      outDir: browserOutDir
    },
    define: {
      ...baseConfig.define,
      'process.env': {
        __APP_PLATFORM__: 'webext'
      }
    },
    plugins: browserPlugins
  }

  // Merge with base config and return
  return mergeConfig(baseConfig, browserConfig)
})
