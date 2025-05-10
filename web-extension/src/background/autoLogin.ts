import { ServiceType } from '@/common/service'
import { logger, WalletHelper } from '@d-chat/core'
import type { WalletJson } from 'nkn-sdk'
import { ChromeStorage } from '../chromeStorage'
import { services } from './services'

const storage = new ChromeStorage('sync')

export class AutoLoginManager {
  private static instance: AutoLoginManager

  public static getInstance(): AutoLoginManager {
    if (!AutoLoginManager.instance) {
      AutoLoginManager.instance = new AutoLoginManager()
    }
    return AutoLoginManager.instance
  }

  private async getWalletInfo(): Promise<{ keystore: WalletJson; password: string } | null> {
    try {
      const walletHelper = new WalletHelper(storage)

      const password = await walletHelper.getPassword()
      if (password === undefined) {
        return null
      }

      const wallet = await walletHelper.getDefaultWallet()
      if (!wallet) {
        return null
      }

      return {
        keystore: wallet.keystore,
        password
      }
    } catch (error) {
      logger.error('Failed to get wallet info:', error)
      return null
    }
  }

  public async tryAutoLogin(): Promise<boolean> {
    try {
      const walletInfo = await this.getWalletInfo()
      if (!walletInfo) {
        return false
      }

      const walletHelper = new WalletHelper(storage)
      const { seed, publicKey } = await walletHelper.restoreNknWallet(walletInfo.keystore, walletInfo.password)
      if (!seed) {
        return false
      }

      await services[ServiceType.Db].openDb(publicKey, seed)
      await services[ServiceType.dchat].init()
      await services[ServiceType.Connect].connect(seed)

      logger.info('Auto login successful')
      return true
    } catch (error) {
      logger.error('Auto login error:', error)
      return false
    }
  }
}
