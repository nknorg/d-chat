import { IService, Service, ServiceType } from '@/common/service'
import { i18n } from '@/plugins/i18n'
import { useClientStore } from '@/stores/client'
import { useCommonStore } from '@/stores/common'
import { useWalletStore } from '@/stores/wallet'
import { LightTheme } from '@/theme/light'
import { SkinTheme } from '@/theme/theme'
import { Db, LocalStorage, StoreAdapter } from '@d-chat/core'
import { ref } from 'vue'

export class Application {
  public loading = ref(false)
  public theme: SkinTheme = new LightTheme()
  public service: IService = new Service()
  public db: Db = Db

  async initialize(): Promise<void> {
    this.loading.value = true
    if (process.env.__APP_PLATFORM__ == 'electron') {
      this.service = new Service()
    } else if (process.env.__APP_PLATFORM__ == 'webext') {
      import('../../web-extension/src/connectEventListener')
      import('../../web-extension/src/dchatEventListener')
      const module = await import('../../web-extension/src/chromeStorage')
      StoreAdapter.setLocalStorage(new module.ChromeStorage('sync'))
      StoreAdapter.setRpcServerCache(new module.ChromeStorage('local'))
      const module2 = await import('../../web-extension/src/service')
      this.service = new module2.Service()

      const walletStore = useWalletStore()
      const wallet = await walletStore.getDefault()
      if (wallet) {
        await Db.openDb(wallet.publicKey, '')
      }
    } else {
      import('./connectEvent')
      StoreAdapter.setRpcServerCache(new LocalStorage())
      this.service = new Service()
    }

    // upgrade
    if (process.env.__APP_PLATFORM__ == 'electron') {
      // upgrade
    } else if (process.env.__APP_PLATFORM__ == 'webext') {
      // upgrade
    } else {
      // upgrade
    }

    const commonStore = useCommonStore()
    const deviceId = await commonStore.getDeviceId()
    // init dchat
    this.service.call(ServiceType.dchat, 'setDeviceId', deviceId)

    // init i18n
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

    const clientStore = useClientStore()
    await clientStore.getLastSignInId()
    await clientStore.getLastSignInStatus()

    // auto sign in
    const walletStore = useWalletStore()
    const password = await walletStore.getPassword()
    if (password !== undefined) {
      const wallet = await walletStore.getDefault()
      if (wallet === null) {
        this.loading.value = false
        return
      }
      const { seed } = await walletStore.restoreNknWallet(wallet.keystore, password)
      if (seed !== undefined) {
        await clientStore.connect(seed)
      }
    }

    this.loading.value = false
    return
  }
}

const application = new Application()

export { application }
