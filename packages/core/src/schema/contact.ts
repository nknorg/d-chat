import { randomColorList1, randomColorList2 } from './contactEnum'


export interface IContactOptions {
  deleteAfterSeconds?: number
  updateBurnAfterAt?: number
  avatarBgColor?: string
  avatarFgColor?: string

}

export interface IContactSchema {
  id?: number
  createAt?: number
  updateAt?: number
  address: string
  type: number
  avatar?: string
  firstName?: string
  lastName?: string
  profileVersion?: string
  profileExpiresAt?: number
  isTop: boolean
  options?: IContactOptions
  data?: object
}

export class ContactSchema implements IContactSchema {
  public id?: number
  public createAt?: number
  public updateAt?: number
  public address: string
  public type: number
  public avatar?: string
  public firstName?: string
  public lastName?: string
  public profileVersion?: string
  public profileExpiresAt?: number
  public isTop: boolean
  public options?: IContactOptions
  public data?: object

  constructor(schema: IContactSchema) {
    this.id = schema.id
    this.createAt = schema.createAt
    this.updateAt = schema.updateAt
    this.address = schema.address
    this.type = schema.type
    this.avatar = schema.avatar
    this.firstName = schema.firstName
    this.lastName = schema.lastName
    this.profileVersion = schema.profileVersion
    this.profileExpiresAt = schema.profileExpiresAt
    this.isTop = schema.isTop
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

  // toDbModel(): ContactDbModel {
  //   return {
  //     id: this.id,
  //     create_at: this.createAt ?? Date.now(),
  //     update_at: this.updateAt,
  //     address: this.address,
  //     type: this.type,
  //     avatar: this.avatar,
  //     first_name: this.firstName,
  //     last_name: this.lastName,
  //     profile_version: this.profileVersion,
  //     profile_expires_at: this.profileExpiresAt,
  //     is_top: this.isTop,
  //     options: JSON.stringify(this.options),
  //     data: JSON.stringify(this.data)
  //   }
  // }

  // static fromDbModel(model: ContactDbModel) {
  //   return new ContactSchema({
  //     data: model.data ? JSON.parse(model.data) : null,
  //     options: model.options ? JSON.parse(model.options) : null,
  //     id: model.id,
  //     createAt: model.create_at,
  //     updateAt: model.update_at,
  //     address: model.address,
  //     type: model.type,
  //     avatar: model.avatar,
  //     firstName: model.first_name,
  //     lastName: model.last_name,
  //     profileVersion: model.profile_version,
  //     profileExpiresAt: model.profile_expires_at,
  //     isTop: model.is_top
  //   })
  // }
}
