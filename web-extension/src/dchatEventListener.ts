// @ts-ignore
const port = chrome.runtime.connect({ name: 'dchat' })

port.onMessage.addListener(function (msg) {
  if (msg.method == 'addMessage') {
    // Handle the incoming message
    console.log('port.onMessage.addMessage:', msg.message)
  } else if (msg.method == 'onMessage') {
  } else if (msg.method == 'onConnectFailed') {
  } else if (msg.method == 'onDisconnect') {
  }
})
export {}
