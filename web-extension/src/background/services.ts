import { ServiceType } from '@/common/service'
import { Connect, Db } from '@d-chat/core'

export const services: Record<ServiceType, any> = {
  [ServiceType.Connect]: Connect,
  [ServiceType.Db]: Db
}
