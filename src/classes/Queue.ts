export class Queue<T> {

  public remaining = 0
  constructor (protected items: T[] = []) {
    this.items = items.slice()
  }

  public next (): T {
    return this.items.shift()
  }

  public peek (): T {
    return this.items[0]
  }

  public push (item: T) {
    this.items.push(item)
  }

  get size () {
    return this.items.length
  }
}
