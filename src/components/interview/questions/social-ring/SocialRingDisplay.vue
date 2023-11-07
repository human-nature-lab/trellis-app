<script setup lang="ts">
import { ref, computed } from 'vue'

export type Ring = {
  varName: string | number
  labelTranslationId: string
  maximum?: number
  minimum?: number
}

export type SocialRingConfig = {
  rings: Ring[]
  sourceQuestionId?: string
  hideAfterMove: boolean
  allowFinalReview: boolean
  showRingVarName: boolean
  finalReviewTranslationId?: string
}

export type PartialRespondent = {
  id: string
  name: string
  avatarSrc: string
}
const props = defineProps<{
  value: Record<string, string | number> // Map of respondent id to ring varName
  ego: PartialRespondent
  hideAfterMove?: boolean
  config: SocialRingConfig
  vertical?: boolean
  respondents: PartialRespondent[]
}>()

const emit = defineEmits<{
  (event: 'change-ring', respondentId: string, ring: Ring): void
}>()

const scale = ref(0.5)
const unitSize = computed(() => scale.value * 130)
const viewBox = computed(() => props.vertical ? { width: 900, height: 1200 } : { width: 1200, height: 900 })
const ringCenter = computed(() => {
  return props.vertical
    ? { x: viewBox.value.width / 2, y: viewBox.value.height / 2 }
    : { x: viewBox.value.width * (3 / 4), y: viewBox.value.height / 2 }
})

type RespondentCircle = {
  respondent: PartialRespondent
  cx: number
  cy: number
  radius: number
}
const numPerRow = 7
const padding = 20
const yOffset = 0
const xOffset = 0

function hasRing (respondentId: string) {
  return props.value[respondentId] !== undefined
}

const respondents = ref<RespondentCircle[]>(props.respondents.map((respondent, i) => {
  if (!hasRing(respondent.id)) {
    return { respondent, cx: 0, cy: 0, radius: unitSize.value / 2 }
  } else {
    const ring = props.value[respondent.id]
    const ringIndex = props.config.rings.findIndex(r => r.varName === ring)
    const ringRadius = (props.config.rings.length - ringIndex) * unitSize.value
    const cx = ringCenter.value.x + ringRadius * Math.cos(i * 2 * Math.PI / props.respondents.length)
    const cy = ringCenter.value.y + ringRadius * Math.sin(i * 2 * Math.PI / props.respondents.length)
    return { respondent, cx, cy, radius: unitSize.value / 2 }
  }
}))

function alignGrid () {
  const gridRespondents = respondents.value.filter(r => !hasRing(r.respondent.id))
  for (let i = 0; i < gridRespondents.length; i++) {
    const row = Math.floor(i / numPerRow)
    const col = i % numPerRow
    gridRespondents[i].cx = xOffset + col * (unitSize.value + padding) + unitSize.value / 2 + padding
    gridRespondents[i].cy = yOffset + row * (unitSize.value + padding) + unitSize.value / 2 + padding
  }
}
alignGrid()

const egoCircle = ref<RespondentCircle>({
  respondent: props.ego,
  cx: viewBox.value.width / 2,
  cy: viewBox.value.height / 2,
  radius: unitSize.value / 2,
})

type Pos = { x: number, y: number }
const draggingCircle = ref<RespondentCircle>()
const draggingRing = ref<number| null>(null)
const startPosition = ref({ circle: { x: 0, y: 0 }, mouse: { x: 0, y: 0 } })
const hoverIndex = ref(-1)

const svg = ref<SVGElement>()
function absPosToSvgPos (p: Pos) {
  const bb = svg.value.getBoundingClientRect()
  return {
    x: (p.x - bb.left) * viewBox.value.width / bb.width,
    y: (p.y - bb.top) * viewBox.value.height / bb.height,
  }
}

const rings = computed<{ cx: number, cy: number, r: number}[]>(() => props.config.rings.map((_, i) => {
  return {
    cx: ringCenter.value.x,
    cy: ringCenter.value.y,
    r: (props.config.rings.length + 0.5 - i) * unitSize.value,
  }
}))

function startDrag (respondent: RespondentCircle, pos: Pos) {
  console.log('start drag', respondent.respondent.id)
  startPosition.value.mouse = pos
  startPosition.value.circle = { x: respondent.cx, y: respondent.cy }
  draggingCircle.value = respondent
  draggingRing.value = null
}

function startDragMouse (index: number, event: MouseEvent) {
  const respondent = respondents.value[index]
  if (hasRing(respondent.respondent.id)) return
  event.preventDefault()
  event.stopPropagation()
  return startDrag(respondent, absPosToSvgPos({ x: event.clientX, y: event.clientY }))
}

function startDragTouch (index: number, event: TouchEvent) {
  const respondent = respondents.value[index]
  if (hasRing(respondent.respondent.id)) return
  event.preventDefault()
  event.stopPropagation()
  return startDrag(respondent, absPosToSvgPos({ x: event.touches[0].clientX, y: event.touches[0].clientY }))
}

function updateDragginPos (mousePos: Pos) {
  if (draggingCircle.value) {
    draggingCircle.value.cx = startPosition.value.circle.x + mousePos.x - startPosition.value.mouse.x
    draggingCircle.value.cy = startPosition.value.circle.y + mousePos.y - startPosition.value.mouse.y
  }
}

function dragMove (pos: Pos) {
  updateDragginPos(pos)
  const dx = ringCenter.value.x - pos.x
  const dy = ringCenter.value.y - pos.y
  const radius = Math.sqrt(dx * dx + dy * dy)
  let ring = null
  // check rings in reverse order
  for (let i = rings.value.length; i--; i > -1) {
    if (radius <= rings.value[i].r) {
      ring = i
      break
    }
  }
  draggingRing.value = ring
}

function dragMoveMouse (event: MouseEvent) {
  if (draggingCircle.value) {
    dragMove(absPosToSvgPos({ x: event.clientX, y: event.clientY }))
  }
}

function dragMoveTouch (event: TouchEvent) {
  if (draggingCircle.value) {
    dragMove(absPosToSvgPos({ x: event.touches[0].clientX, y: event.touches[0].clientY }))
  }
}

function stopDrag (pos: Pos) {
  console.log('stopDrag')
  updateDragginPos(pos)
  if (draggingRing.value !== null) {
    // Reset the grid if they were put in a ring
    const r = draggingCircle.value
    emit('change-ring', r.respondent.id, props.config.rings[draggingRing.value])
    setTimeout(alignGrid, 10)
  } else {
    // Return them to their original position in the grid
    draggingCircle.value.cx = startPosition.value.circle.x
    draggingCircle.value.cy = startPosition.value.circle.y
  }
  draggingCircle.value = null
  draggingRing.value = null
}

function stopDragMouse (event: MouseEvent) {
  if (draggingCircle.value) {
    stopDrag(absPosToSvgPos({ x: event.clientX, y: event.clientY }))
  }
}

function stopDragTouch (event: TouchEvent) {
  if (draggingCircle.value) {
    stopDrag(absPosToSvgPos({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }))
  }
}

const imageBorder = 2
</script>

<template>
  <svg
    ref="svg"
    id="social-ring"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${viewBox.width} ${viewBox.height}`"
    @mouseup="stopDragMouse"
    @mouseleave="stopDragMouse"
    @mousemove="dragMoveMouse"
    @touchmove="dragMoveTouch"
    @touchend="stopDragTouch"
  >
    <text
      fill="black"
      stroke="black"
      x="100"
      y="500"
    >{{ draggingRing }}</text>
    <!-- RINGS -->
    <circle
      v-for="(ring, i) in rings"
      :key="`ring-${i}`"
      :cx="ring.cx"
      :cy="ring.cy"
      fill="lightgrey"
      stroke="grey"
      stroke-width="1"
      class="ring"
      :class="{ active: draggingCircle && draggingRing === i }"
      :r="ring.r"
    />
    <text
      v-for="(ring, i) in props.config.rings"
      :key="`label-${ring.varName}`"
      :x="rings[i].cx"
      :y="rings[i].cy - (rings[i].r - 22)"
      :font-size="18"
      fill="black"
      stroke="black"
      text-anchor="middle"
    >
      {{ ring.varName }}
    </text>

    <!-- EGO -->
    <g :transform="`translate(${ringCenter.x}, ${ringCenter.y})`">
      <circle
        :r="egoCircle.radius"
        class="respondent ego"
      />
      <image
        :href="egoCircle.respondent.avatarSrc"
        :width="egoCircle.radius * 2"
        :height="egoCircle.radius * 2"
        :x="-egoCircle.radius"
        :y="-egoCircle.radius"
        style="clip-path: inset(100 0 0 0 round 50%);"
      />
    </g>

    <!-- Respondents -->
    <g
      v-for="(r, i) in respondents"
      :key="`respondent-${r.respondent.id}`"
      :transform="`translate(${r.cx}, ${r.cy})`"
      :class="{ hidden: hasRing(r.respondent.id) && props.hideAfterMove }"
    >
      <circle
        :r="r.radius"
        :fill="i === hoverIndex ? 'red' : 'black'"
        class="respondent"
      />
      <image
        class="respondent-avatar"
        :class="{ dragging: draggingCircle === r }"
        :href="r.respondent.avatarSrc"
        :width="(r.radius - imageBorder) * 2"
        :height="(r.radius - imageBorder) * 2"
        :x="-(r.radius - imageBorder)"
        :y="-(r.radius - imageBorder)"
        style="clip-path: inset(0 0 0 0 round 50%);"
        @mouseenter="hoverIndex = i"
        @mouseleave="hoverIndex = -1"
        @mousedown="startDragMouse(i, $event)"
        @touchstart="startDragTouch(i, $event)"
      />
    </g>
  </svg>
</template>

<style lang="sass">
#social-ring
  width: 100%
  height: 100%
  .ring
    transition: all 0.5s ease-in-out
    &.active
      fill: yellow
  .respondent-avatar
    transition: all 0.5s ease-in-out
    &:hover
      cursor: grab
    &.dragging
      cursor: grabbing
  .hidden
    display: none
</style>
