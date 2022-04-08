// From here https://stackoverflow.com/a/29018745/5551941
interface CompareFunction<T> {
  (a: T, b: T): number
}

export default class SortedArray<T> extends Array {
  /**
   * Should insert items into the array and keep it sorted
   * @param {T[]} items
   */
  public insertSorted (item: T): void {}
  constructor (readonly __comparator__: CompareFunction<T> = (a: T, b: T) => (<any>a - <any>b)) {
    super()
    this.insertSorted = function (item: T) {
      // TODO: This is basically useless and it should be possible to insert after a binary search instead, but we don't
      // let idx = SortedArray.binarySearch(this, items, this.__comparator__)
      this.push(item)
      this.sort(this.__comparator__)
    }
  }

  /**
   * Do a binary search
   * @param {any[]} ar
   * @param el
   * @param {CompareFunction<any>} compareFunction
   * @returns {number}
   */
  static binarySearch (ar: any[], el: any, compareFunction: CompareFunction<any>) {
    let m = 0
    let n = ar.length - 1
    while (m <= n) {
      let k = (n + m) >> 1
      let cmp = compareFunction(el, ar[k])
      if (cmp > 0) {
        m = k + 1
      } else if (cmp < 0) {
        n = k - 1
      } else {
        return k
      }
    }
    return -m - 1
  }
}
