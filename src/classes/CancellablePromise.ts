export interface PromiseCallback<T> {
  (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void): void
}

export default class CancellablePromise<T> implements PromiseLike<T> {

  public promise: Promise<T>
  private _cancelCallback: Function
  /**
   * Contains a promise. AKA compositional style
   * @param cb
   * @param cancelCallback
   */
  constructor (cb: PromiseCallback<T>, cancelCallback: Function) {
    this.promise = new Promise(cb)
    this._cancelCallback = cancelCallback
  }

  public finally (onFinally?: () => void): any {
    this.promise.finally(onFinally)
    return this
  }

  public catch <TResult = never> (cb?: () => TResult | PromiseLike<TResult>): this {
    this.promise.catch(cb)
    return this
  }

  public then <TResult1 = T, TResult2 = never>(onFulfilled?: (value: T) => TResult1|PromiseLike<TResult1>, onRejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): CancellablePromise<TResult1> {
    this.promise.then(onFulfilled, onRejected)
    // @ts-ignore
    return this
  }

  public cancel () {
    this._cancelCallback()
    return this
  }
}
