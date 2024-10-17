// Math stuff

export function randomInt (min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function random (min = 0, max = 1): number {
  return Math.random() * (max - min) + min
}

export function randomFrom<T> (collection: T[]): T {
  return collection[randomInt(0, collection.length)]
}

/**
 * Returns a random integer with the specified number of bits
 * @param {number} bits
 * @returns {number}
 */
export function randomIntBits (bits: number): number {
  if (bits > 53) {
    throw new Error('higher than the maximum allowed bits in JS')
  } else if (bits === 53) {
    return randomInt(0, Number.MAX_SAFE_INTEGER - 1) // We add one in randomInt, so we need to subtract one to make sure this doesn't lead to undefined behavior
  } else {
    return randomInt(0, Math.pow(2, bits))
  }
}

/**
 * Get a rough estimate of the number of bytes used by anything
 * @param object
 */
export function roughSizeOf (object: any) {
  const objectList = []
  const stack = [object]
  let bytes = 0

  while (stack.length) {
    const value = stack.pop()

    if (typeof value === 'boolean') {
      bytes += 4
    } else if (typeof value === 'string') {
      bytes += value.length * 2
    } else if (typeof value === 'number') {
      bytes += 8
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value)
      for (const i in value) {
        stack.push(value[i])
      }
    }
  }
  return bytes
}

// Returns the number rounded to the specified number of decimal places
export function roundDecimals (value: number, decimals = 2): number {
  const d = Math.pow(10, decimals)
  return Math.round(value * d) / d
}

window.roundDecimals = roundDecimals
