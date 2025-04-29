import { application } from '@/common/application'
import { ServiceType } from '@/common/service'
import { useClientStore } from '@/stores/client'
import { ContactType, IContactSchema, SessionType } from '@d-chat/core'
import { defineStore } from 'pinia'
import { ContactSchema } from '@d-chat/core'
import { TopicSchema } from '@d-chat/core'

const STORE_NAME = 'contact'

interface ContactData {
  type: SessionType
  address: string
  data: ContactSchema | TopicSchema
}

export const useContactStore = defineStore(STORE_NAME, {
  state: () => ({
    contactInfoMap: {} as Record<string, ContactData>
  }),

  actions: {
    async getContactInfoMap({ type, address }: { type: SessionType; address: string }) {
      const key = `${type}-${address}`
      const cached = this.contactInfoMap[key]
      if (cached) {
        return cached.data
      } else {
        const data = await this.queryContactInfo({ type, address })
        if (data) {
          this.contactInfoMap[key] = { type, address, data }
          return data
        }
      }
    },
    async queryContactInfo({ type, address }: { type: SessionType; address: string }) {
      const key = `${type}-${address}`

      let data
      if (type === SessionType.CONTACT) {
        const clientStore = useClientStore()
        let conteactType = ContactType.STRANGER
        if (clientStore.lastSignInId === address) {
          conteactType = ContactType.ME
        }
        data = await application.service.call(ServiceType.dchat, 'getOrCreateContact', address, { type: conteactType })
      } else if (type === SessionType.TOPIC) {
        data = await application.service.call(ServiceType.dchat, 'getTopicInfo', address)
      }

      if (data) {
        this.contactInfoMap[key] = { type, address, data }
      }
      return data
    },

    async updateContact(contact: Partial<IContactSchema>) {
      await application.service.call(ServiceType.dchat, 'updateContact', contact)
    }
  }
})
