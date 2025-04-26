export class ClientNotReadyError extends Error {
  constructor() {
    super('Client is not ready')
    this.name = 'ClientNotReadyError'
  }
}
