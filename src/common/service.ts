import { Connect } from '@d-chat/core'

export enum ServiceType {
  Connect = 'Connect'
}

export interface IService {
  call: (service: string, method: string, ...args: any[]) => any
  on: (service: string, method: string, ...args: any[]) => any
}

export class Service implements IService {
  services: Record<ServiceType, any> = {
    [ServiceType.Connect]: Connect
  }

  call(service: string, method: string, ...args: any[]): any {
    return this.services[service][method](...args)
  }

  on(service: string, method: string, ...args: any[]): any {}
}
