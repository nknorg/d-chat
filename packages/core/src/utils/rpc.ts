import axios from 'axios'

const rpcTimeout = 10000

export async function getNodeState(addr) {
  return rpcCall(addr, 'getnodestate', { rpcServerAddr: addr })
}

export async function rpcCall(addr, method, params = {}) {
  const controller = new AbortController()
  const { signal } = controller
  let response: any = null

  setTimeout(() => {
    controller.abort()
  }, rpcTimeout)


  try {
    response = await axios({
      url: addr,
      method: 'POST',
      timeout: rpcTimeout,
      signal: signal,
      data: {
        id: 'nkn-sdk-js',
        jsonrpc: '2.0',
        method: method,
        params: params
      }
    })
  } catch (e) {
    if (axios.isCancel(e)) {
      throw e
    } else {
      throw e
    }
  }

  let data = response.data

  if (data.error) {
    throw data.err
  }

  if (data.result !== undefined) {
    return data.result
  }

  throw data.error
}
