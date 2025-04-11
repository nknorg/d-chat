import log, { LogLevelDesc } from 'loglevel'

if (process.env.NODE_ENV === 'production') {
  log.setDefaultLevel('debug')
} else {
  log.setDefaultLevel('trace')
}

export class Logger {
  setLevel(level: LogLevelDesc) {
    log.setLevel(level)
  }

  getLevel(): LogLevelDesc {
    return log.getLevel()
  }

  trace(...msg: any[]): void {
    log.trace(...msg)
  }

  debug(...msg: any[]): void {
    log.debug(...msg)
  }

  info(...msg: any[]): void {
    log.info(...msg)
  }

  warn(...msg: any[]): void {
    log.warn(...msg)
  }

  error(...msg: any[]): void {
    log.error(...msg)
  }
}

export const logger = new Logger()
