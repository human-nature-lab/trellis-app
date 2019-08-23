export class Queue<T> {

  constructor (private items: T[] = []) {}

  next (): T | null {
    return this.items.shift()
  }

  push (item: T) {
    this.items.push(item)
  }

}
