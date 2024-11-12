import { Hook } from '@/classes/Hook'
import { CancelTokenSource } from 'axios'
export type Stringable = string | { toString(): string }

export type StepController = {
  source: CancelTokenSource
  isCancelled: boolean
  setMessage (msg: Stringable, color?: string)
  confirm (msg: Stringable, color?: 'success' | 'error' | 'warn'): Promise<boolean>
  log: {
    warn (...args: any)
    info (...args: any)
    error (...args: any)
  }
  setProgress (value: number, total: number, showValue?: boolean)
  onCancel: Hook<[Error], void>
}

export type GroupController = StepController & {
  addStep (groupId: number, title: Stringable): number
  setStep (id: number)
}

export type VueController = GroupController & {
  addGroup (title: Stringable): number
  setGroup (id: number)
  done ()
}
