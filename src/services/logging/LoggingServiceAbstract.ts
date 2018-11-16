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

  abstract async log (_request):Promise<Log|void>
  abstract async getLogPage (page: number, limit: number|null): Promise<Log[]>
  abstract async getLogCount (): Promise<number>
  abstract async getUploadedCount (): Promise<number>

  createLog (_request: LogRequest): Log {
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

  getSeverity (request: LogRequest) {
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

  getMessage (request: LogRequest) {
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

  getFullMessage (request: LogRequest) {
    if (typeof request === 'object') {
      if (request.hasOwnProperty('fullMessage')) {
        return request.fullMessage
      } else {
        return JSON.stringify(request, Object.getOwnPropertyNames(request), 2)
      }
    }
    return null
  }

  getComponent (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('component')) {
      return request.component
    }
    return null
  }

  getSyncId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('syncId')) {
      return request.syncId
    }
    return null
  }

  getInterviewId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('interviewId')) {
      return request.interviewId
    }
    return null
  }

  getDeviceId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('deviceId')) {
      return request.deviceId
    } else {
      return singleton.deviceId
    }
  }

  getUserId (request: LogRequest) {
    if (typeof request === 'object' && request.hasOwnProperty('userId')) {
      return request.userId
    } else {
      return singleton.user ? singleton.user.id : null
    }
  }
}
