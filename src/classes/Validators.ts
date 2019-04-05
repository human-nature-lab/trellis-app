export interface Validator<In> {
  (val: In):  boolean | string
}

export interface HasLength {
  length: number
}

export default class Validators {
  static minLength (min: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return val.length >= min ? true : invalidResponse || false
    }
  }
  static maxLength (max: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return val.length <= max ? true : invalidResponse || false
    }
  }
  static betweenLength (min: number, max: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return val.length >= min && val.length <= max ? true : invalidResponse || false
    }
  }

  static min (min: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return val >= min ? true : invalidResponse || false
    }
  }

  static max (max: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return val <= max ? true : invalidResponse || false
    }
  }

  static between (min: number, max: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return val >= min && val <= max ? true : invalidResponse || false
    }
  }
}
