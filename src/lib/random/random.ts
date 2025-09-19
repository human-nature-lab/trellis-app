export interface Source {
  next32(): number // returns a 32-bit integer
}

function stringTo32BitInteger (str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

// Adapted from an implementation mentioned here: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
export class JSF32bSource implements Source {
  private a: number
  private b: number
  private c: number
  private d: number

  constructor (seed: number | string) {
    if (typeof seed === 'string') {
      seed = stringTo32BitInteger(seed)
    }
    this.a = 0xF1EA5EED
    this.b = seed
    this.c = seed
    this.d = seed
    for (let i = 0; i < 20; i++) {
      this.next32()
    }
  }

  next32 (): number {
    this.a |= 0; this.b |= 0; this.c |= 0; this.d |= 0
    const t = this.a - (this.b << 23 | this.b >>> 9) | 0
    this.a = this.b ^ (this.c << 16 | this.c >>> 16) | 0
    this.b = this.c + (this.d << 11 | this.d >>> 21) | 0
    this.b = this.c + this.d | 0
    this.c = this.d + t | 0
    this.d = this.a + t | 0
    return (this.d >>> 0) / 4294967296
  }
}

export class Random {
  constructor (private source: Source) {}

  // Equivalent to Math.random(). Returns a float in the range [0, 1)
  random (): number {
    return this.source.next32()
  }

  // Returns a random integer in the range [0, n)
  randomInt(max: number): number
  // Returns a random integer in the range [min, max)
  randomInt(min: number, max: number): number
  randomInt (min: number, max?: number): number {
    return Math.floor(this.randomFloat(min, max))
  }

  // Returns a random integer in the range [0, max)
  randomFloat(max: number): number
  // Returns a random float in the range [min, max)
  randomFloat(min: number, max: number): number
  randomFloat (min: number, max?: number): number {
    if (max === undefined) {
      max = min
      min = 0
    }
    return this.random() * (max - min) + min
  }

  // Performs a fisher-yates shuffle on an array
  shuffle<T> (array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Returns a random subset of the array of the given size
  subset<T> (array: T[], size: number): T[] {
    const subset: T[] = []
    if (size > array.length) {
      size = array.length
      const res = array.slice()
      this.shuffle(res)
      return res
    }
    const indices: number[] = []
    for (let i = 0; i < size; i++) {
      indices.push(i)
    }
    this.shuffle(indices)
    for (let i = 0; i < size; i++) {
      subset.push(array[indices[i]])
    }
    return subset
  }
}