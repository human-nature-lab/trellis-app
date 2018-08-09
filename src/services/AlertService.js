import { defaultLoggingService } from '../services/logging/LoggingService'
import Emitter from '../classes/Emitter'
class AlertService extends Emitter {
  constructor () {
    super()
    this.alerts = []
    this.on('alert', this.addAlert, this)
  }
  addAlert (alert) {
    const log = defaultLoggingService.createLog(alert)
    this.alerts.push(log)
  }
  getAlerts () {
    return this.alerts
  }
  removeAlert () {
    this.alerts.pop()
  }
}

export default new AlertService()
