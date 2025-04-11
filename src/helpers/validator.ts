import { ComponentInternalInstance, getCurrentInstance } from 'vue'
import { isValidNknClientAddress } from '@d-chat/core'

export class Validator {
  private ins: ComponentInternalInstance

  constructor() {
    this.ins = getCurrentInstance()!
  }

  required(): any {
    return (v: string) => !!v || this.ins.proxy?.$t('error_required')
  }

  confirmPassword(password: string): any {
    return (v: string) => v == password || this.ins.proxy?.$t('error_confirm_password')
  }

  isNknSeed(): any {
    return (v: string) =>
      (v.length == 64 && /^[0-9A-Fa-f]{64}$/.test(v)) ||
      this.ins.proxy?.$t('error_confirm_password')
  }

  isValidDchatAddress(): any {
    return (v: string) => {
      return isValidNknClientAddress(v) || this.ins.proxy?.$t('error_client_address_format')
    }
  }
}
