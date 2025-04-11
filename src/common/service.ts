import { Connect, Db, Dchat } from '@d-chat/core'

export enum ServiceType {
  Connect = 'Connect',
  Db = 'Db',
  dchat = 'dchat'
}

export interface IService {
  call: (service: string, method: string, ...args: any[]) => any
}

export const services: Record<ServiceType, any> = {
  [ServiceType.Connect]: Connect,
  [ServiceType.Db]: Db,
  [ServiceType.dchat]: new Dchat()
}

export class Service implements IService {
  call(service: string, method: string, ...args: any[]): any {
    return services[service][method](...args)
  }
}
