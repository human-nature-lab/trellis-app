// Math stuff

import {TreeItem} from "performant-array-to-tree";

export function randomInt (min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function random (min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min
}


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
