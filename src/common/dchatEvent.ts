import { useChatStore } from '@/stores/chat'
import { useMessageStore } from '@/stores/message'
import { useSessionStore } from '@/stores/session'
import { Dchat, MessageSchema, SessionSchema } from '@d-chat/core'

export function addDchatEvents(ins: Dchat) {
  const chatStore = useChatStore()
  const messageStore = useMessageStore()
  const sessionStore = useSessionStore()
  ins.addMessage = (message: MessageSchema) => {
    if (chatStore.currentTargetId == message.targetId) {
      messageStore.addMessage(message)
    }
  }

  ins.updateMessage = (message: MessageSchema) => {
    if (chatStore.currentTargetId == message.targetId) {
      messageStore.updateMessage(message)
    }
  }

  ins.updateSession = (session: SessionSchema) => {
    sessionStore.updateSession(session)
  }
}
