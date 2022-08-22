import { CancelTokenSource } from 'axios'
import { TranslateResult } from 'vue-i18n'

export type UIController = {
  source: CancelTokenSource
  isCancelled: boolean
  confirm (msg: string | TranslateResult, color?: 'success' | 'error' | 'warn'): Promise<boolean>
  log: {
    warn (...args: any)
    info (...args: any)
    error (...args: any)
  }
  setProgress (percentage: number)
  afterAll<T extends any[]>(cb: (err: Error | undefined, ...args: T) => void): Promise<void>
}
