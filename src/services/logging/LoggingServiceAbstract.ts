import merge from 'lodash/merge'
import uuid from 'uuid/v4'
import Log from '../../entities/trellis-config/Log'
import defaultConfig from './DefaultLoggingConfig'
import config from '../../config'
import {LoggingConfig, LoggingLevel, LogRequest} from "./LoggingTypes";
import singleton from "../../static/singleton";
import {now} from '../DateService'

declare const VERSION: string
const version: string = VERSION
console.log(`Trellis v${version}`)
const defaultSeverity = LoggingLevel.info

export default abstract class LoggingServiceAbstract {

  defaultOptions: object
  protected config: LoggingConfig

  constructor (options?) {
    this.config = merge(defaultConfig, config.logging)
    this.defaultOptions = {}
    if (typeof options === 'object') {
      merge(this.defaultOptions, options)
    }
  }

  abstract async log (_request): Promise<Log|void>
  abstract async getLogPage (page: number, limit: number|null): Promise<Log[]>
  abstract async getLogCount (): Promise<number>
  abstract async getUploadedCount (): Promise<number>

  private transformToLog (_request: any): object {
    if (typeof _request === 'string') {
      return {
        msg: _request
      }
    } else {
      return _request
    }
  }

  public error (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.error
    return this.log(_request)
  }

  public warn (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.warn
    return this.log(_request)
  }

  public info (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.info
    return this.log(_request)
  }

  public debug (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.debug
    return this.log(_request)
  }

  public trace (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.trace
    return this.log(_request)
  }

  public verbose (_request): Promise<Log|void> {
    _request = this.transformToLog(_request)
    if (_request) _request.severity = LoggingLevel.verbose
    return this.log(_request)
  }


  /**
   * Logic for writing the log to the console
   * @param {Log} log
   */
  protected consoleLog (log: Log): void {
    if (this.config.console) {
      if (console[log.severity]) {
        console[log.severity](log.message, log)
      } else {
        console.log(log.message, log)
      }
    }
  }

  /**
   * Check if this log should be filtered out or not
   * @param {Log} log
   * @returns {boolean}
   */
  protected shouldWriteLog (log: Log): boolean {
    return !this.config.levels || this.config.levels.indexOf(log.severity as LoggingLevel) > -1
  }

  protected createLog (_request: LogRequest): Log {
    if (_request === null || _request === undefined) {
      throw new Error('Invalid logger request')
    }
    const request = merge(_request, this.defaultOptions)
    const log = new Log()
    log.id = uuid()
    log.message = this.getMessage(request)
    log.severity = this.getSeverity(request)
    log.fullMessage = this.getFullMessage(request)
    log.component = this.getComponent(request)
    log.syncId = this.getSyncId(request)
    log.interviewId = this.getInterviewId(request)
    // TODO: Can't we just grab these?
    log.deviceId = this.getDeviceId(request)
    log.userId = this.getUserId(request)
    log.createdAt = now()
    log.version = version
    log.offline = singleton.offline
    log.userAgent = navigator.userAgent
    return log
  }

  protected getSeverity (request: LogRequest) {
    if (typeof request === 'object') {
      if (request instanceof Error) {
        return LoggingLevel.error
      }
      if (request.hasOwnProperty('severity')) {
        return request.severity
      }
    }
    return defaultSeverity
  }

  protected getMessage (request: LogRequest) {
    if (typeof request === 'string') {
      return request
    }
    if (typeof request === 'object') {
      if (request.hasOwnProperty('message') && typeof request.message === 'string') {
        return request.message
      }
      if (request.hasOwnProperty('msg') && typeof request.msg === 'string') {
        return request.msg
      }
    }
    return ''
  }

  protected getFullMessage (request: LogRequest) {
    if (typeof request === 'object') {
      if (request.hasOwnProperty('fullMessage')) {
        return request.fullMessage
      } else {
        return JSON.stringify(request, Object.getOwnPropertyNames(request), 2)
      }
    }
    return null
  }

  protected getComponent (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('component')) {
      return request.component
    }
    return null
  }

  protected getSyncId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('syncId')) {
      return request.syncId
    }
    return null
  }

  protected getInterviewId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('interviewId')) {
      return request.interviewId
    }
    return null
  }

  protected getDeviceId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('deviceId')) {
      return request.deviceId
    } else {
      return singleton.deviceId
    }
  }

  protected getUserId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('userId')) {
      return request.userId
    } else {
      return singleton.user ? singleton.user.id : null
    }
  }
}
