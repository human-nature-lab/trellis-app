import DatabaseService from '../database/DatabaseService'
import AlertService from '../../services/AlertService'
import LoggingServiceAbstract from './LoggingServiceAbstract'
const writeToConsole = true

class LoggingServiceCordova extends LoggingServiceAbstract {

  async log (_request) {
    if (_request === null || _request === undefined) {
      throw new Error('Invalid logger request')
    }
    const log = this.createLog(_request)
    try {
      const connection = await DatabaseService.getConfigDatabase()
      await connection.manager.save(log)
      if (writeToConsole) {
        if (console.hasOwnProperty(log.severity)) {
          console[log.severity](log.message, log)
        } else {
          console.log(log.message, log)
        }
      }
    } catch (err) {
      AlertService.emit('alert', err)
    }
    return log
  }

}

export default LoggingServiceCordova
