import { Ref, ref, watch } from 'vue'

type Grid = {
  cols: number
  rows: number
  children?: Grid[]
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

function computeRects (parent: Rect, grid: Grid): Ref<Rect>[] {

}

export function useGrid (container: Ref<HTMLElement>, grid: Grid) {
  const rects = ref<Ref<Rect>[]>([])
  const parent = ref<Rect>({
    x: 0,
    y: 0,
    width: container.value.clientWidth,
    height: container.value.clientHeight,
  })
  watch(container, () => {
    parent.value = {
      x: 0,
      y: 0,
      width: container.value.clientWidth,
      height: container.value.clientHeight,
    }
    rects.value = [parent].concat(computeRects(parent.value, grid))
  }, { immediate: true })
  return rects
}
