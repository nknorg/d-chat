export function formatAddress(address: string): string {
  const prefix = address.slice(0, 6)
  const suffix = address.slice(-6)
  return `${prefix}......${suffix}`
}

export function getDefaultName(address: string): string {
  return address.slice(0, 6)
}

export function ensureUrl(str: string): string {
  const regex = /^(http:\/\/|https:\/\/)/;
  if (!regex.test(str)) {
    return 'http://' + str;
  }
  return str;
}
