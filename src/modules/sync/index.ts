import { Hook } from '@/classes/Hook'
import axios from 'axios'
import { TranslateResult } from 'vue-i18n'

export type StepResult<T> = {
  message: string | TranslateResult
  data?: T
}

export interface StepController {
  confirm (msg: string | TranslateResult, color?: string): Promise<boolean>
  setProgress (progress: number, total: number)
}

export interface Step<T, R> {
  name: string
  description?: string
  run (data: T, ctrl: StepController, log: typeof console): Promise<StepResult<R>>
}

export interface DisplayStep<T, R> {
  id: number
  status: 'pending' | 'running' | 'success' | 'error'
  message?: {
    color?: string
    value: string | TranslateResult
  }
  step: Step<T, R>
}

export class Controller {
  public source = axios.CancelToken.source()
  public isCancelled = false
  public onCancel = new Hook()
  public log = console
  constructor (
    public confirm: (msg: string | TranslateResult, color?: string) => Promise<boolean>,
    public setProgress: (progress: number, total: number) => void,
  ) {}

  cancel () {
    this.isCancelled = true
    this.source.cancel()
    this.onCancel.emit()
  }

}
