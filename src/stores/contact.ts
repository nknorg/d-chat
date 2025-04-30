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
  state: (): {
    contactInfoMap: Record<string, ContactData>
    myProfile: ContactSchema
  } => ({
    contactInfoMap: {},
    myProfile: undefined
  }),
  actions: {
    async getMyProfile() {
      const clientStore = useClientStore()
      const result = await this.getContactInfo({ type: SessionType.CONTACT, address: clientStore.lastSignInId })
      if (result) {
        this.myProfile = result
      }
      return this.myProfile
    },
    async getContactInfo({ type, address }: { type: SessionType; address: string }) {
      const key = `${type}-${address}`
      const cached = this.contactInfoMap[key]
      const hasProfile = !!cached?.data?.profileVersion
      const hasAvatar = !!cached?.data?.avatar
      if (cached && hasProfile && hasAvatar) {
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

      // Update local cache
      const key = `${SessionType.CONTACT}-${contact.address}`
      const existingData = this.contactInfoMap[key]
      if (existingData) {
        // Update the cached data with new values
        Object.assign(existingData.data, contact)
        // Update myProfile if it's my profile
        if (contact.address === useClientStore().lastSignInId && this.myProfile) {
          Object.assign(this.myProfile, contact)
        }
      }
    }
  }
})
