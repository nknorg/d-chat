export type ConnectHandler = (id: string, ...args: any[]) => void
export type MessageHandler = (id: string, ...args: any[]) => void
export type ConnectFailedHandler = (id: string, ...args: any[]) => void
export type DisconnectEventHandler = (id: string, ...args: any[]) => void

export class ConnectEvent {
  private static _onConnect: ConnectHandler
  private static _onMessage: MessageHandler
  private static _onConnectFailed: ConnectFailedHandler
  private static _onDisconnect: DisconnectEventHandler

  static set onConnect(handler: ConnectHandler) {
    this._onConnect = handler
  }

  static get onConnect() {
    return this._onConnect
  }

  static set onMessage(handler: MessageHandler) {
    this._onMessage = handler
  }

  static get onMessage() {
    return this._onMessage
  }

  static set onConnectFailed(handler: ConnectFailedHandler) {
    this._onConnectFailed = handler
  }

  static get onConnectFailed() {
    return this._onConnectFailed
  }

  static set onDisconnect(handler: DisconnectEventHandler) {
    this._onDisconnect = handler
  }
}
