export enum LoggingLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  verbose = 'verbose',
  debug = 'debug',
  trace = 'trace'
}

export interface LoggingConfig {
  levels: 0 | LoggingLevel[]
  console: boolean
  max: number
  rate: number
}

export interface LogRequest {
  message: string
  msg?: string
  severity?: LoggingLevel
  fullMessage?: string
  component?: string
  syncId?: string
  interviewId?: string
  deviceId?: string
  userId?: string
}
