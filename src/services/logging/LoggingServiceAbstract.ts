import merge from 'lodash/merge'
import uuid from 'uuid/v4'
import Log from '../../entities/trellis-config/Log'
const defaultSeverity = 'info'

export default abstract class LoggingServiceAbstract {

  defaultOptions: object

  constructor (options) {
    this.defaultOptions = {}
    if (typeof options === 'object') {
      merge(this.defaultOptions, options)
    }
  }

  createLog (_request) {
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
    log.deviceId = this.getDeviceId(request)
    log.userId = this.getUserId(request)
    log.createdAt = new Date()
    return log
  }

  abstract async log (_request):Promise<Log|void>

  getSeverity (request) {
    if (typeof request === 'object') {
      if (request instanceof Error) {
        return 'error'
      }
      if (request.hasOwnProperty('severity')) {
        return request.severity
      }
    }
    return defaultSeverity
  }

  getMessage (request) {
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

  getFullMessage (request) {
    if (typeof request === 'object') {
      if (request.hasOwnProperty('fullMessage')) {
        return request.fullMessage
      } else {
        return JSON.stringify(request, Object.getOwnPropertyNames(request), 2)
      }
    }
    return null
  }

  getComponent (request) {
    if (typeof request === 'object' && request.hasOwnProperty('component')) {
      return request.component
    }
    return null
  }

  getSyncId (request) {
    if (typeof request === 'object' && request.hasOwnProperty('syncId')) {
      return request.syncId
    }
    return null
  }

  getInterviewId (request) {
    if (typeof request === 'object' && request.hasOwnProperty('interviewId')) {
      return request.interviewId
    }
    return null
  }

  getDeviceId (request) {
    if (typeof request === 'object' && request.hasOwnProperty('deviceId')) {
      return request.deviceId
    }
    return null
  }

  getUserId (request) {
    if (typeof request === 'object' && request.hasOwnProperty('userId')) {
      return request.userId
    }
    return null
  }
}
