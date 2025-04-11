export function isValidNknClientAddress(addr: string): boolean {
  // Check if the address contains a dot (.)
  const parts = addr.split('.')

  // If there's no dot, check if it's a valid public key (64 hex characters)
  if (parts.length === 1) {
    const hexRegex = /^[0-9a-fA-F]{64}$/
    return hexRegex.test(addr)
  }

  // If there's a dot, the last part should be a valid public key
  if (parts.length > 1) {
    const publicKey = parts[parts.length - 1]
    const hexRegex = /^[0-9a-fA-F]{64}$/
    return hexRegex.test(publicKey)
  }

  return false
}
