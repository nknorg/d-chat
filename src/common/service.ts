import { useNotificationStore } from '@/stores/notification'
import { ClientNotReadyError, Connect, Db, Dchat, logger } from '@d-chat/core'
import { i18n } from '@/plugins/i18n'

export enum ServiceType {
  Connect = 'Connect',
  Db = 'Db',
  dchat = 'dchat'
}

export interface IService {
  call(service: string, method: string, ...args: any[]): Promise<any>
}

export const services: Record<ServiceType, any> = {
  [ServiceType.Connect]: Connect,
  [ServiceType.Db]: Db,
  [ServiceType.dchat]: new Dchat()
}

export class Service implements IService {
  async call(service: string, method: string, ...args: any[]) {
    try {
      return await services[service][method](...args)
    } catch (error) {
      logger.error(error)
      if (error instanceof ClientNotReadyError) {
        const notificationStore = useNotificationStore()
        notificationStore.error({
          title: i18n.global.t('connect_not_ready'),
          message: i18n.global.t('connect_not_ready_message')
        })
      }

      throw error
    }
  }
}
