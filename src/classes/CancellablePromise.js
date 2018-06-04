export default class CancellablePromise {
  /**
   * Contains a promise. AKA compositional style
   * @param cb
   * @param cancelCallback
   */
  constructor (cb, cancelCallback) {
    this.promise = new Promise(cb)
    this._cancelCallback = cancelCallback
  }

  finally (cb) {
    this.promise.finally(cb)
    return this
  }

  catch (cb) {
    this.promise.catch(cb)
    return this
  }

  then (cb) {
    this.promise.then(cb)
    return this
  }

  cancel () {
    this._cancelCallback()
    return this
  }
}
