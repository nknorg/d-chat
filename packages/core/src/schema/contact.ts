import { ContactDbModel } from '../protocol/database/contact'
import { ContactType, randomColorList1, randomColorList2 } from './contactEnum'

export interface IContactOptions {
  deleteAfterSeconds?: number
  updateBurnAfterAt?: number
  avatarBgColor?: string
  avatarFgColor?: string
}

export interface IContactSchema {
  id?: number
  createdAt?: number
  updatedAt?: number
  address: string
  walletAddress?: string
  type: ContactType
  avatar?: string
  firstName?: string
  lastName?: string
  profileVersion?: string
  profileExpiresAt?: number
  options?: IContactOptions
  data?: object
}

export class ContactSchema implements IContactSchema {
  public id?: number
  public createdAt?: number
  public updatedAt?: number
  public address: string
  public walletAddress?: string
  public type: ContactType
  public avatar?: string
  public firstName?: string
  public lastName?: string
  public profileVersion?: string
  public profileExpiresAt?: number
  public options?: IContactOptions
  public data?: object

  constructor(schema: IContactSchema) {
    this.id = schema.id
    this.createdAt = schema.createdAt
    this.updatedAt = schema.updatedAt
    this.address = schema.address
    this.walletAddress = schema.walletAddress
    this.type = schema.type
    this.avatar = schema.avatar
    this.firstName = schema.firstName
    this.lastName = schema.lastName
    this.profileVersion = schema.profileVersion
    this.profileExpiresAt = schema.profileExpiresAt
    this.options = schema.options ?? {}
    this.data = schema.data

    const random = Math.floor(Math.random() * 6) + 1
    if (this.options.avatarBgColor == null) {
      this.options.avatarBgColor = randomColorList1[random]
    }
    if (this.options.avatarFgColor == null) {
      this.options.avatarFgColor = randomColorList2[random]
    }
  }

  get displayName(): string {
    if (this.firstName != null && this.firstName.length > 0) {
      return this.firstName
    }

    const index = this.address.lastIndexOf('.')
    if (index < 0) {
      return this.address.substring(0, 6)
    } else if (this.address.length > index + 7) {
      return this.address.substring(0, index + 7)
    } else {
      return this.address
    }
  }

  toDbModel(): ContactDbModel {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      address: this.address,
      wallet_address: this.walletAddress,
      type: this.type,
      avatar: this.avatar,
      first_name: this.firstName,
      last_name: this.lastName,
      profile_version: this.profileVersion,
      profile_expires_at: this.profileExpiresAt,
      options: this.options != null ? JSON.stringify(this.options) : undefined,
      data: this.data != null ? JSON.stringify(this.data) : undefined
    }
  }

  static fromDbModel(model: ContactDbModel) {
    return new ContactSchema({
      id: model.id,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      address: model.address,
      walletAddress: model.wallet_address,
      type: model.type,
      avatar: model.avatar,
      firstName: model.first_name,
      lastName: model.last_name,
      profileVersion: model.profile_version,
      profileExpiresAt: model.profile_expires_at,
      options: model.options ? JSON.parse(model.options) : undefined,
      data: model.data ? JSON.parse(model.data) : undefined
    })
  }
}
