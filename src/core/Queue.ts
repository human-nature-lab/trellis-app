export interface Queue<T> {
  push(item: T)
  pop (): T | null
  items (): T[]
}

export class MaxQueue<T>implements Queue<T> {
  constructor (public max = 15) {}
  push (item: T) {

  }

  pop (): T | null {

  }

  items (): T[] {
    const res = []
    return res
  }
}
