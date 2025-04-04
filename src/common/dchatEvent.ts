import { Dchat, MessageSchema } from '@d-chat/core'

export function addDchatEvents(instance: Dchat) {
  instance.addMessage = (message: MessageSchema) => {
    // Handle the incoming message
    console.log('Received addDchatEvents:', message)
  }
}
