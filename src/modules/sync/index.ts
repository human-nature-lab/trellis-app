import axios from 'axios'
import { TranslateResult } from 'vue-i18n'

export type ProgressHandler = (progress: number, total: number) => void

export type StepResult<T> = {
  message: string | TranslateResult
  data?: T
}

export interface StepController {
  confirm (msg: string | TranslateResult, color?: string): Promise<boolean>
}

export interface Step<T, R> {
  messages?: string[]
  name: string
  description?: string
  run (data: T, ctrl: StepController, log: typeof console): Promise<StepResult<R>>
  setProgress? (ProgressHandler): void
}

export class Controller {
  public source = axios.CancelToken.source()
  public isCancelled = false
  public log = console
  constructor (public confirm: (msg: string | TranslateResult, color?: string) => Promise<boolean>) {}

  cancel () {
    this.isCancelled = true
    this.source.cancel()
  }

  run<T, K> (data: T, step: Step<T, K>) {
    return step.run(data, this, this.log)
  }
}
