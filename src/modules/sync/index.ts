import { Hook } from '@/classes/Hook'
import { i18n } from '@/i18n'
import axios from 'axios'
import { TranslateResult } from 'vue-i18n'
import { VueController } from './controller'

export type StepResult<T> = {
  message: string | TranslateResult
  data?: T
}

export interface DisplayStep<T, R> {
  id: number
  status: 'pending' | 'running' | 'success' | 'error'
  message?: {
    color?: string
    value: string | TranslateResult
  }
}

type Ctrl = Pick<VueController,
  'setGroup' |'addGroup' |'addStep' |'setStep' | 'confirm' | 'setProgress' | 'done' | 'setMessage'
>

export class Controller implements VueController {
  public source = axios.CancelToken.source()
  public isCancelled = false
  public onCancel = new Hook()
  public log = console
  public setGroup: VueController['setGroup']
  public addGroup: VueController['addGroup']
  public addStep: VueController['addStep']
  public setStep: VueController['setStep']
  public confirm: VueController['confirm']
  public setProgress: VueController['setProgress']
  public setMessage: VueController['setMessage']
  public done: VueController['done']
  constructor (private ctrl: Ctrl) {
    this.setGroup = this.ctrl.setGroup
    this.addGroup = this.ctrl.addGroup
    this.addStep = this.ctrl.addStep
    this.setStep = this.ctrl.setStep
    this.confirm = this.ctrl.confirm
    this.setProgress = this.ctrl.setProgress
    this.setMessage = this.ctrl.setMessage
    this.done = this.ctrl.done
  }

  cancel () {
    this.isCancelled = true
    this.source.cancel()
    this.onCancel.emit(new Error(i18n.t('operation_canceled').toString()))
  }
}
