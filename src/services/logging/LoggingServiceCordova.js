import _ from 'lodash'
import uuid from 'uuid/v4'
import Log from '../../entities/trellis-config/Log'
import DatabaseService from '../database/DatabaseService'
import AlertService from '../../services/AlertService'
const defaultSeverity = 'info'

class LoggingServiceCordova {

  constructor (options) {
    this.defaultOptions = {}
    if (typeof options === 'object') {
      _.merge(this.defaultOptions, options)
    }
  }

  createLog (_request) {
    if (_request === null || _request === undefined) {
      throw new Error('Invalid logger request')
    }
    const request = _.merge(_request, this.defaultOptions)
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

  async log (_request) {
    if (_request === null || _request === undefined) {
      throw new Error('Invalid logger request')
    }
    const log = this.createLog(_request)
    try {
      const connection = await DatabaseService.getConfigDatabase()
      await connection.manager.save(log)
      /* For debug purposes only */
      const logs = await connection.getRepository(Log).find()
      console.log('logs', logs)
      /* For debug purposes only */
      throw new Error('Testing global alert service')
    } catch (err) {
      AlertService.emit('alert', err)
    }
    return log
  }

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
      if (request.hasOwnProperty('message')) {
        return request.message
      }
      if (request.hasOwnProperty('msg')) {
        return request.msg
      }
    }
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

export default LoggingServiceCordova
