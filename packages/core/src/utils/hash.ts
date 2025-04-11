import * as crypto from 'crypto'

export function bytesToHex(bytes: Uint8Array): string {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

const hexRe = /^[0-9a-f]+$/i

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 === 1) {
    throw new RangeError('invalid hex string length ' + hex.length)
  }
  if (!hexRe.test(hex)) {
    throw new RangeError('invalid hex string')
  }
  const bytes: number[] = []
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16))
  }
  return new Uint8Array(bytes)
}

const isNode = typeof process !== 'undefined' && !!process.versions?.node

export async function sha1(raw: string) {
  if (isNode) {
    const { createHash } = await import('crypto')
    return createHash('sha1').update(raw).digest('hex')
  } else {
    const encoder = new TextEncoder()
    const data = encoder.encode(raw)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

export function unleadingHashIt(str: string) {
  return str.replace(/^#*/, '')
}

export async function genChannelId(topic: string) {
  const t = unleadingHashIt(topic)
  const hash = await sha1(t)
  return 'dchat' + hash
}
