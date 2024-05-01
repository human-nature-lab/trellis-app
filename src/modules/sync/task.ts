import { Stringable } from '@/types'
import { TranslateResult } from 'vue-i18n'

export class TaskExecution {
  public status: 'pending' | 'running' | 'complete' | 'cancelled' | 'error' = 'pending'
  public progress = { total: 0, current: 0 }
  public error?: Error
  public data: Record<string, any> = {}
  public log: {
    warn (...args: any)
    info (...args: any)
    error (...args: any)
  }
  public exec: TaskExec

  private whenCancelled: () => void

  constructor (task: Task) {
    Object.assign(this.data, task.data)
    this.exec = task.exec
    this.log = {
      warn: (...args: any) => console.warn(task.name, ...args),
      info: (...args: any) => console.info(task.name, ...args),
      error: (...args: any) => console.error(task.name, ...args),
    }
  }

  onCancel (fn: () => void) {
    this.whenCancelled = fn
  }

  cancel () {
    this.status = 'cancelled'
    if (this.whenCancelled) {
      this.whenCancelled()
    }
  }
}

type TaskExec<I = any, O = any> = (input: I, task: TaskExecution) => (PromiseLike<O> | O)

export class Task<Input = any, Output = any> {
  public data: Record<string, any> = {}
  public mergeData = false
  public parent?: Task<any, Input>

  constructor (public name: Stringable, public exec: TaskExec<Input, Output>) {}
  add<NextOutput = any> (name: Stringable, exec: TaskExec<Output, NextOutput>, data?: Record<string, any>) {
    const task = new Task(name, exec)
    if (data) {
      Object.assign(task.data, data)
    }
    return this.addTask(task)
  }

  addTask<NextOutput = any> (task: Task<Output, NextOutput>) {
    task.parent = this
    return task
  }

  addMerge<NextOutput = any, Merged = NextOutput & Output> (name: Stringable, exec: TaskExec<Output, NextOutput>, data?: Record<string, any>) {
    const task = new Task(name, exec)
    if (data) {
      Object.assign(task.data, data)
    }
    task.mergeData = true
    task.parent = this
    return task as Task<Output, Merged>
  }
}

export class Runner<Output = any> {
  public tasks: TaskExecution[] = []
  public isRunning = false
  private isInitialized = false
  public currentTask: TaskExecution = null

  constructor (public task: Task<any, Output>) {}

  init () {
    if (this.isInitialized) return
    this.isInitialized = true
    let current = this.task
    while (current) {
      const e = new TaskExecution(current)
      this.tasks.unshift(e)
      current = current.parent
    }
  }

  async run (): Promise<Output> {
    this.init()
    let input: any
    let output: any
    this.isRunning = true
    for (const task of this.tasks) {
      try {
        task.status = 'running'
        output = await task.exec(input, task)
        task.status = 'complete'
      } catch (e) {
        task.error = e
        task.status = 'error'
        return
      }
    }
    this.isRunning = false
    return output
  }
}
