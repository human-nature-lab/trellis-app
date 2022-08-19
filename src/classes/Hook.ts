export type Listener<T extends any[], R> = (...args: T) => R
export type AsyncListener<T extends any[], R> = (...args: T) => R | Promise<R>

export class Hook<T extends any[], R> {
  private listeners: Listener<T, R>[] = []

  add (cb: Listener<T, R>) {
    this.listeners.push(cb)
  }

  emit (...args: T) {
    for (const fn of this.listeners) {
      fn(...args)
    }
  }

  remove (cb: Listener<T, R>) {
    const index = this.listeners.indexOf(cb)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  clear () {
    this.listeners = []
  }
}

export class AsyncHook<T extends any[], R> {
  private listeners: AsyncListener<T, R>[] = []

  add (cb: AsyncListener<T, R>) {
    this.listeners.push(cb)
  }

  async emit (...args: T) {
    for (const fn of this.listeners) {
      await fn(...args)
    }
  }

  remove (cb: AsyncListener<T, R>) {
    const index = this.listeners.indexOf(cb)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  clear () {
    this.listeners = []
  }
}
