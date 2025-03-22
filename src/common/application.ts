// import { useWalletStore } from '../stores/wallet'
import { ILocalStorage } from '@d-chat/core'
import { useTheme } from 'vuetify'
import { LocalStorage } from './localStorage'
import { ChromeStorageSync } from '../../web-extension/src/chromeStorageSync'
import { LightTheme } from '@/theme/light'
import { SkinTheme } from '@/theme/theme'

export class Application {

  public loading: boolean = false
  public theme: SkinTheme = new LightTheme()
  public localStorage: ILocalStorage

  constructor() {
    if (process.env.__APP_PLATFORM__ == 'electron') {
      this.localStorage = new LocalStorage()
    } else if (process.env.__APP_PLATFORM__ == 'webext') {
      this.localStorage = new ChromeStorageSync()
    } else {
      this.localStorage = new LocalStorage()
    }
  }

  async initialize(): Promise<void> {
    this.loading = true

    // const walletStore = useWalletStore()
    // await walletStore.getAll()

    this.loading = false
    return
  }

  switchTheme(t: string) {
    const theme = useTheme()
    theme.global.name.value = t
  }
}


const application = new Application()
export { application }
