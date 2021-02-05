export class ExpiringValue<T> {

  private val = null
  private expiresAt = 0

  constructor (public lifetime: number) {}

  set (v: T) {
    this.val = v
    this.expiresAt = Date.now() + this.lifetime
  }

  get (): T | void {
    if (Date.now() < this.expiresAt) {
      return this.val
    }
    this.clear()
  }
  
  clear () {
    this.val = null
    this.expiresAt = 0
  }
  
}