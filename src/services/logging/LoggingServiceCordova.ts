import DatabaseService from '../database/DatabaseService'
import AlertService from '../../services/AlertService'
import LoggingServiceAbstract from './LoggingServiceAbstract'
import Log from "../../entities/trellis-config/Log";
import throttle from 'lodash/throttle'
import {LogRequest} from "./LoggingTypes";

class LoggingServiceCordova extends LoggingServiceAbstract {

  private queue: Log[] = []
  private save: Function
  private isSaving: boolean = false
  private hasDeferredData: boolean = false

  constructor (options?) {
    super(options)
    if (this.config.rate === 0) {
      this.save = this.flushQueue
    } else {
      this.save = throttle(this.flushQueue.bind(this), this.config.rate)
    }
  }

  /**
   * Logic for writing the log to disk without any overlapping
   * @returns {Promise<boolean>}
   */
  async flushQueue (): Promise<boolean> {
    // Don't allow any overlapping
    if (this.isSaving) {
      this.hasDeferredData = true
      return
    }
    const saving = this.queue.slice()
    if (saving.length === 0) {
      return // No need to save when the queue is empty
    }
    this.isSaving = true
    console.info(`writing ${saving.length} logs to disk`)
    try {
      const connection = await DatabaseService.getConfigDatabase()
      await connection.manager.save(saving)
      this.queue.splice(0, saving.length) // Remove the saved items from the queue
      return true
    } catch (err) {
      AlertService.emit('alert', err)
      return false
    } finally {
      // Call save again in the scenario where we have saved data
      if (this.hasDeferredData) {
        console.log(`${this.queue.length} logs were added during saving. Saving them now.`)
        this.save()
      }
      this.isSaving = false
    }
  }

  /**
   * Logic for writing the log to the console
   * @param {Log} log
   */
  private consoleLog (log: Log): void {
    if (this.config.console) {
      if (console[log.severity]) {
        console[log.severity](log.message, log)
      } else {
        console.log(log.message, log)
      }
    }
  }

  /**
   * The logged method
   * @param _request
   * @returns {Promise<Log>}
   */
  public async log (_request: LogRequest) {
    if (_request === null || _request === undefined) {
      throw new Error('Invalid logger request')
    }
    const log = this.createLog(_request)
    this.consoleLog(log)
    this.queue.push(log)
    if (this.config.max > 0 && this.queue.length > this.config.max) {
      this.flushQueue()
    } else {
      this.save()
    }
    return log
  }

  public async getLogPage (page: number, limit: number, sortBy?: string, descending?: boolean): Promise<Log[]> {
    const repo = await DatabaseService.getConfigRepository(Log)
    let order = sortBy ? {
      [sortBy]: descending ? 'DESC' : 'ASC'
    } : {}
    return repo.find({
      take: limit,
      skip: page * limit,
      order
    })
  }

  public async getLogCount (): Promise<number> {
    const repo = await DatabaseService.getConfigRepository(Log)
    return repo.count()
  }

}

export default LoggingServiceCordova
