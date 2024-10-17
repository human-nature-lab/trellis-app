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

  clone (): Hook<T, R> {
    const h = new Hook<T, R>()
    h.listeners = this.listeners.slice()
    return h
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

  clone (): AsyncHook<T, R> {
    const h = new AsyncHook<T, R>()
    h.listeners = this.listeners.slice()
    return h
  }
}

export class AsyncResultHook<T extends any[], R> {
  private listeners: AsyncListener<T, R>[] = []

  add (cb: AsyncListener<T, R>) {
    this.listeners.push(cb)
  }

  async emit<R> (...args: T): Promise<R> {
    let res: any
    for (const fn of this.listeners) {
      res = await fn(...args)
    }
    return res as R
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

  clone (): AsyncResultHook<T, R> {
    const h = new Hook<T, R>()
    h.listeners = this.listeners.slice()
    return h
  }
}
