import { IContactSchema } from '../schema/contact'

export function getNickName(contact: IContactSchema): string {
  if (contact == null) return '';
  if (contact.lastName != null && contact.lastName.length > 0) {
    return contact.lastName
  }
  const index = contact.address.lastIndexOf('.')
  if (index < 0) {
    return contact.address.substring(0, 6)
  } else if (contact.address.length > (index + 7)) {
    return contact.address.substring(0, index + 7)
  } else {
    return contact.address
  }
}
