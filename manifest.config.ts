import { env } from 'node:process'
import type { ManifestV3Export } from '@crxjs/vite-plugin'
import packageJson from './package.json' with { type: 'json' }

const { version, name, description, displayName } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default {
  author: {
    email: 'peng.liu@nkn.org'
  },
  name: env.mode === 'staging' ? `[INTERNAL] ${name}` : displayName || name,
  description,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  action: {
    default_popup: 'web-extension/src/ui/action-popup/index.html'
  },
  background: {
    service_worker: 'web-extension/src/background/index.ts',
    type: 'module'
  },
  // content_scripts: [
  //   {
  //     all_frames: false,
  //     js: ["src/content-script/index.ts"],
  //     matches: ["*://*/*"],
  //   },
  // ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  },
  side_panel: {
    default_path: 'index.html'
  },
  // devtools_page: "src/devtools/index.html",
  // options_page: "src/ui/options-page/index.html",
  offline_enabled: true,
  host_permissions: ['<all_urls>'],
  permissions: ['storage', 'tabs', 'background', 'sidePanel', 'notifications'],
  // web_accessible_resources: [
  //   {
  //     resources: [
  //       "src/ui/setup/index.html",
  //       "src/ui/content-script-iframe/index.html",
  //       "src/ui/devtools-panel/index.html",
  //     ],
  //     matches: ["<all_urls>"],
  //   },
  // ],
  icons: {
    16: 'assets/d-chat/logo.png',
    24: 'assets/d-chat/logo.png',
    32: 'assets/d-chat/logo.png',
    128: 'assets/d-chat/logo.png'
  }
} as ManifestV3Export
