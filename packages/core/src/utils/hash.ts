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
