/// <reference types="vite/client" />

import 'vue-i18n'

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: I18n['t']
    $tc: I18n['tc']
    $te: I18n['te']
    $tm: I18n['tm']
    $rt: I18n['rt']
    $i18n: I18n
  }
}
