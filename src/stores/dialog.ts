import { defineStore } from 'pinia'

const STORE_NAME = 'dialog'
export const useDialogStore = defineStore(STORE_NAME, {
  state: (): {
    title: string
    content: string
    type: string
    confirmDialog: boolean
    confirmDialogResults: any
    confirmDialogResolve: ((value: boolean | PromiseLike<boolean>) => void) | null
  } => {
    return {
      title: '',
      content: '',
      type: 'info',
      confirmDialog: false,
      confirmDialogResults: null,
      confirmDialogResolve: null
    }
  },
  actions: {
    async showConfirm({ title, content, type = 'info' }: { title: string; content: string; type?: string }): Promise<boolean> {
      this.title = title
      this.content = content
      this.type = type
      this.confirmDialog = true
      return new Promise((resolve) => {
        this.confirmDialogResolve = resolve
      })
    },
    closeConfirm() {
      this.confirmDialog = false
    },
    async handleConfirmOk() {
      this.closeConfirm()
      this.confirmDialogResults = true
      if (this.confirmDialogResolve) {
        this.confirmDialogResolve(this.confirmDialogResults)
      }
    },
    async handleConfirmCancel() {
      this.closeConfirm()
      this.confirmDialogResults = false
      if (this.confirmDialogResolve) {
        this.confirmDialogResolve(this.confirmDialogResults)
      }
    }
  }
})
