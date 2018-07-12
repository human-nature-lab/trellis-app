// From here https://stackoverflow.com/a/29018745/5551941
function binarySearch (ar, el, compareFunction) {
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

export default class SortedArray extends Array {
  constructor (comparator = null) {
    super()
    this.__comparator__ = comparator || function (a, b) { return a - b }
    this.insertSorted = function (items) {
      // if (Array.isArray(items)) {
      //   for (let item of items) {
      //     this.insertSorted(item)
      //   }
      // }
      // if (this.length) {
      let idx = binarySearch(this, items, this.__comparator__)
      console.log(idx)
      //   this.splice(idx, 0, items)
      // } else {
      //   this.push(items)
      // }
      // TODO: This is basically useless and it should be possible to insert after a binary search instead, but we don't
      this.push(items)
      this.sort(this.__comparator__)
    }
  }
}
