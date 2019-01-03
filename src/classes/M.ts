// Math stuff

import {TreeItem} from "performant-array-to-tree";

export function randomInt (min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function random (min: number = 0, max: number = 1): number {
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

export function interpolateColor (percentage: number, minColor: string, maxColor: string) {
  function interpolate (p: number, minHex: string, maxHex: string): string {
    const maxNum = parseInt(maxHex, 16)
    const minNum = parseInt(minHex, 16)
    const v = p * (maxNum - minNum) + minNum
    if (v < 16) {
      return '0' + Math.floor(v).toString(16)
    } else if (v < 256) {
      return '' + Math.floor(v).toString(16)
    } else {
      return 'ff'
    }
  }
  return '#' +
    interpolate(percentage, minColor.substr(0, 2), maxColor.substr(0, 2)) +
    interpolate(percentage, minColor.substr(2, 4), maxColor.substr(2, 4)) +
    interpolate(percentage, minColor.substr(4, 6), maxColor.substr(4, 6));
}

export function interpolateHeatmap (val: number, bins: number[], colorMap: string[]) {
  if (bins.length !== colorMap.length) throw new Error('Supplied bins and colorMap should match')
  if (val <= bins[0]) {
    return '#' + colorMap[0]
  } else if (val >= bins[bins.length - 1]) {
    return '#' + colorMap[bins.length - 1]
  }

  let leftColor, rightColor, p = 0
  for (let i = 0; i < bins.length - 1; i++) {
     if (val > bins[i] && val <= bins[i + 1]) {
       leftColor = colorMap[i]
       rightColor = colorMap[i + 1]
       p = (bins[i + 1] - val) / (bins[i + 1] - bins[i])
       break
     }
  }

  if (leftColor == null || rightColor == null) {
    throw new Error('Invalid bins')
  }

  return interpolateColor(p, leftColor, rightColor)

}

// @ts-ignore
window.interpolateHeatmap = interpolateHeatmap
// @ts-ignore
window.interpolateColor = interpolateColor

export function getBottomLevelOfTree<T> (tree: TreeItem<T>[]): TreeItem<T>[] {
  const bottomItems: TreeItem<T>[] = []
  const lookup: Map<T|null, TreeItem<T>> = new Map()
  const queue = tree.slice()
  let item = queue.pop()
  while (item) {
    if (item.children.length) {
      queue.push(...item.children)
    } else {
      bottomItems.push({
        data: item.data,
        children: []
      })
    }

    item = queue.pop()
  }
  return bottomItems
}
