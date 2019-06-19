export interface Validator<In> {
  (val: In):  boolean | string
}

export interface HasLength {
  length: number
}

export default class Validators {
  static minLength (min: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return ValidationRules.minLength(val, min) || invalidResponse || false
    }
  }
  static maxLength (max: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return ValidationRules.maxLength(val, max) || invalidResponse || false
    }
  }
  static betweenLength (min: number, max: number, invalidResponse?: string): Validator<HasLength> {
    return function (val: HasLength) {
      return (val.length >= min && val.length <= max) ? true : invalidResponse || false
    }
  }

  static min (min: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return ValidationRules.min(val, min) || invalidResponse || false
    }
  }

  static max (max: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return ValidationRules.max(val, max) || invalidResponse || false
    }
  }

  static between (min: number, max: number, invalidResponse?: string): Validator<number> {
    return function (val: number) {
      return (val >= min && val <= max) ? true : invalidResponse || false
    }
  }

  static required (invalidResponse?: string): Validator<any> {
    return function (val: any) {
      return  ValidationRules.required(val) || invalidResponse || false
    }
  }

  static email (invalidResponse?: string): Validator<string> {
    return function (val: string) {
      return ValidationRules.email(val) || invalidResponse || false
    }
  }
}

export class ValidationRules {

  static emailRegEx = /\S+@\S+\.\S+/i

  static max (val: number, max: number): boolean {
    return ValidationRules.required(val) && val <= max
  }

  static min (val: number, min: number): boolean {
    return ValidationRules.required(val) && val >= min
  }

  static between (val: number, min: number, max: number): boolean {
    return ValidationRules.min(val, min) && ValidationRules.max(val, max)
  }

  static required (val: any): boolean {
    return val !== null && val !== undefined
  }

  static minLength (val: HasLength, min: number): boolean {
    return ValidationRules.required(val) && ValidationRules.min(val.length, min)
  }

  static maxLength (val: HasLength, max: number): boolean {
    return ValidationRules.required(val) && ValidationRules.max(val.length, max)
  }

  static betweenLength (val: HasLength, min: number, max: number): boolean {
    return ValidationRules.between(val.length, min, max)
  }

  static email (val: string): boolean {
    return ValidationRules.required(val) && val != null && ValidationRules.emailRegEx.test(val.toLowerCase())
  }
}
