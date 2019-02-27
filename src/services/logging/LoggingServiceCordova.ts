import DatabaseService from '../database/DatabaseService'
import AlertService from '../../services/AlertService'
import LoggingServiceAbstract from './LoggingServiceAbstract'
import Log from "../../entities/trellis-config/Log";
import throttle from 'lodash/throttle'
import {LoggingLevel, LogRequest} from "./LoggingTypes";
import {IsNull, Not} from "typeorm";
import {Mutex, MutexInterface} from "async-mutex";

class LoggingServiceCordova extends LoggingServiceAbstract {

  private queue: Log[] = []
  private save: Function
  private isSaving: boolean = false
  private hasDeferredData: boolean = false
  private mutex = new Mutex()
  private releaseMutex!: MutexInterface.Releaser

  constructor (options?) {
    super(options)
    if (this.config.rate === 0) {
      this.save = this.flushQueue
    } else {
      this.save = throttle(this.flushQueue.bind(this), this.config.rate)
      setInterval(this.save.bind(this), 5000)
    }
  }

  /**
   * Logic for writing the log to disk without any overlapping
   * @returns {Promise<boolean>}
   */
  async flushQueue (): Promise<boolean> {
    // Don't allow any overlapping
    this.releaseMutex = await this.mutex.acquire()

    const saving = this.queue.slice()
    if (saving.length === 0) {
      return // No need to save when the queue is empty
    }
    console.info(`writing ${saving.length} logs to disk`)
    let succeeded = false
    try {
      const connection = await DatabaseService.getConfigDatabase()
      await connection.manager.save(saving)
      this.queue.splice(0, saving.length) // Remove the saved items from the queue
      succeeded = true
    } catch (err) {
      AlertService.emit('alert', err)
      succeeded = false
    } finally {
      // Call finalSave again in the scenario where we have saved data
      this.releaseMutex()
      return succeeded
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
    if (this.shouldWriteLog(log)) {
      this.consoleLog(log)
      this.queue.push(log)
      if (this.config.max > 0 && this.queue.length > this.config.max) {
        await this.flushQueue()
      } else {
        await this.save()
      }
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

  public async getUploadedCount (): Promise<number> {
    const repo = await DatabaseService.getConfigRepository(Log)
    return repo.count({
      uploadedAt: Not(IsNull())
    })
  }

  public async deleteUploaded (): Promise<void> {
    const repo = await DatabaseService.getConfigRepository(Log)
    return repo.delete()
  }

}

export default LoggingServiceCordova
