
export enum Level {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export type LogWriter = {
  debug (...args: any[]): void
  info (...args: any[]): void
  warn (...args: any[]): void
  error (...args: any[]): void
}

class Logger {
  public level: Level
  private writer: LogWriter = console

  setLevel (newLevel: Level) {
    this.level = newLevel
  }

  setWriter (writer: LogWriter) {
    this.writer = writer
  }

  info (...args: any[]) {
    if (this.level <= Level.INFO) {
      this.writer.info(...args)
    }
  }

  debug (...args: any[]) {
    if (this.level <= Level.DEBUG) {
      this.writer.debug(...args)
    }
  }

  warn (...args: any[]) {
    if (this.level <= Level.WARN) {
      this.writer.warn(...args)
    }
  }

  error (...args: any[]) {
    if (this.level <= Level.ERROR) {
      this.writer.error(...args)
    }
  }
}

export default new Logger()
