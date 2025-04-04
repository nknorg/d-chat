import { IService } from '@/common/service'

export class Service implements IService {
  call(service: string, method: string, ...args: any[]): any {
    return chrome.runtime.sendMessage({ type: 'service', service, method, args })
  }
}

export const service = new Service()
