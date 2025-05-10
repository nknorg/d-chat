import { logger } from '@d-chat/core'
import { WalletHelper, WalletRecord } from '@d-chat/core'
import { ChromeStorage } from './chromeStorage'

const version = 1
const versionKey = '_version'
const localStorage = new ChromeStorage('local')
const syncStorage = new ChromeStorage('sync')
const walletHelper = new WalletHelper(syncStorage)

export async function upgrade() {
  logger.debug('Upgrade web extension start...')
  const oldVersion: number = await localStorage.get(versionKey) || 0
  logger.debug(`oldVersion: ${oldVersion}, version: ${version}`)
  if (oldVersion < version) {
    if (oldVersion < 1) {
      logger.debug(`Upgrading to version 1`)
      const clients: any = await localStorage.get('clientsMeta')

      if (clients) {
        for (const client of clients) {
          // if client.addr has . publicKey is split[1]
          const splitAddr = client.addr.split('.')
          let publicKey = client.addr
          if (splitAddr.length > 1) {
            publicKey = splitAddr[1]
          }
          const walletAddr = client.wallet.Address
          const wallet: WalletRecord = {
            address: walletAddr,
            name: client.identifier,
            keystore: client.wallet,
            publicKey: publicKey,
            balance: client.balance
          }
          await walletHelper.addWallet(wallet)
          await walletHelper.setDefaultWallet(walletAddr)
        }
      }

      await localStorage.set(versionKey, version)
    }
  } else {
    logger.debug('No need to upgrade.')
  }
  logger.debug('Upgrade web extension end.')
}
