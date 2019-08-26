export class Queue<T> {

  constructor (private items: T[] = []) {}

  next (): T | null {
    return this.items.shift()
  }

  push (item: T) {
    this.items.push(item)
  }

  peek (): T | null {
    return this.items.length ? this.items[0] : null
  }

}
