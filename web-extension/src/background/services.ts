import { ServiceType } from '@/common/service'
import { Connect, Db, Dchat } from '@d-chat/core'

export const services: Record<ServiceType, any> = {
  [ServiceType.Connect]: Connect,
  [ServiceType.Db]: Db,
  [ServiceType.dchat]: new Dchat()
}
