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
      return (val.length >= min && val.length <= max) ? true : invalidResponse || false
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
      return (val >= min && val <= max) ? true : invalidResponse || false
    }
  }

  static required (invalidResponse?: string): Validator<any> {
    return function (val: any) {
      return (val !== null && val !== undefined) ? true : invalidResponse || false
    }
  }

  static email (invalidResponse?: string): Validator<string> {
    return function (val: string) {
      const emailRegEx = /\S+@\S+\.\S+/i
      return (val != null && emailRegEx.test(val.toLowerCase())) ? true : invalidResponse || false
    }
  }
}