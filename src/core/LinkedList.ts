interface ListNode<T> {
  next?: ListNode<T>
  prev?: ListNode<T>
  data: T
}

export interface List<T> {
  size(): number
  push (item: T): void
  pop (): T | void
  items (): T[]
}

export class LinkedList<T> implements List<T> {
  private len = 0
  private head?: ListNode<T>
  private tail?: ListNode<T>

  size (): number {
    return this.len
  }

  push (data: T) {
    if (!this.head) {
      this.head = {
        data,
      }
      this.tail = this.head
    }
    const item = {
      prev: this.head,
      data: data,
    }
    this.head = item
    this.len++
  }

  pop (): T | void {
    if (!this.head) return
    const item = this.head
    this.head = item.prev
    this.len--
    return item.data
  }

  items (): T[] {
    const res = []
    let item = this.head
    while (item) {
      res.push(item.data)
      item = item.next
    }
    return res
  }
}
