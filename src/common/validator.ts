import {ComponentInternalInstance, getCurrentInstance} from 'vue'


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
    return (v: string) => (v.length == 64 && /^[0-9A-Fa-f]{64}$/.test(v)) || this.ins.proxy?.$t('error_seed_format')
  }
}
