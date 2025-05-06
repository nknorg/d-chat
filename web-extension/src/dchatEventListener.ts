// @ts-ignore
import { useChatStore } from '@/stores/chat'
import { useMessageStore } from '@/stores/message'
import { useSessionStore } from '@/stores/session'

// @ts-ignore
const port = chrome.runtime.connect({ name: 'dchat' })

port.onMessage.addListener(function (msg) {
  const chatStore = useChatStore()
  const messageStore = useMessageStore()
  const sessionStore = useSessionStore()

  if (msg.method == 'addMessage') {
    if (chatStore.currentTargetId == msg.message.targetId) {
      messageStore.addMessage(msg.message)
    }
  } else if (msg.method == 'updateMessage') {
    messageStore.updateMessage(msg.message)
  } else if (msg.method == 'updateSession') {
    sessionStore.updateSession(msg.session)
  }
})
export {}
