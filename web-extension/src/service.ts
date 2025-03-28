import { IService } from '@/common/service'

export class Service implements IService {
  constructor() {}

  call(service: string, method: string, ...args: any[]): any {
    return chrome.runtime.sendMessage({ service, method, args })
  }

  on(service: string, method: string, ...args: any[]): any {
    return
  }
}

export const service = new Service()
