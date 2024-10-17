import { CancelTokenSource } from 'axios'
import { Hook } from './Hook'

export class Context {
  isCanceled = false
  source: CancelTokenSource
  onCancel = new Hook<[Error | void], void>()

  cancel (err?: Error) {
    this.isCanceled = true
    this.source.cancel()
    this.onCancel.emit(err)
  }
}
