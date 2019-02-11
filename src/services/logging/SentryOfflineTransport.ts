import PersistentQueue from '../../classes/PersistentQueue'
import storage from '../StorageService'
import {setAsyncInterval} from '../../classes/AsyncInterval'
import { serialize } from '@sentry/utils/object'
import { SentryEvent, SentryResponse, Status } from '@sentry/types'
import * as Sentry from '@sentry/browser'

export interface OfflineTransportOptions {
  dsn: string
  onlineIntervalRate?: number
}

export default class SentryOfflineTransport extends Sentry.Transports.FetchTransport {

  public queue: PersistentQueue<string> = new PersistentQueue('sentry-offline', storage)
  private _isOnline: boolean = true
  public asyncIntervalId: number

  constructor (options: OfflineTransportOptions) {
    super(options)
    this.asyncIntervalId = setAsyncInterval(this.checkIfCanUpload.bind(this),  options.onlineIntervalRate)
  }

  private async checkIfCanUpload () {
    const isOnline = await this.isOnline()
    if (isOnline) {
      await this.drainQueue()
    }
  }

  private async isOnline () {
    return navigator.onLine
  }

  async captureEvent (event: SentryEvent): Promise<SentryResponse> {
    await this.queue.push(serialize(event))
    return {
      status: Status.Success
    }
  }

  private async sendLatest (event?: string) {
    return this.queue.next(async event => {
      const res = await this.sendEvent(event)
      if (res.status === Status.Failed) {
        return false
      }
    })
  }

  private async drainQueue () {
    let size = await this.queue.size()
    while (size > 0) {
      if (await this.isOnline()) {
        try {
          await this.sendLatest()
          const newSize = await this.queue.size()
          if (size === newSize) {
            break
          }
          size = newSize
        } catch (err) {
          // The send failed for some reason so we should just stop attempting to send.
          // TODO: Implement this after a certain threshold of events have failed
          break
        }
      } else {
        break
      }
    }
  }

}
