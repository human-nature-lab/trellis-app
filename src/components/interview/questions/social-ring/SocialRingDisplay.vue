<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type Ring = {
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

type PartialRespondent = {
  id: string
  name: string
  avatarSrc: string
}
const props = defineProps<{
  ego: PartialRespondent
  config: SocialRingConfig
  respondents: PartialRespondent[]
}>()

const emit = defineEmits<{
  (event: 'rings', respondentRings: Record<string, string>): void
}>()

const cols = ref()
watch(() => cols.value, () => {
  console.log('cols changed', cols.value)
})

const viewBox = { width: 1200, height: 900 }
const scale = ref(0.5)
const unitSize = computed(() => scale.value * viewBox.width / 10)

type RespondentCircle = {
  respondent: PartialRespondent
  cx: number
  cy: number
  radius: number
  ring?: number
}
const numPerRow = 7
const padding = 20
const yOffset = 0
const xOffset = 0

const respondents = ref<RespondentCircle[]>(props.respondents.map((respondent, i) => {
  return { respondent, cx: 0, cy: 0, radius: unitSize.value / 2 }
}))
function alignGrid () {
  const gridRespondents = respondents.value.filter(r => r.ring === undefined || r.ring === null)
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
  cx: viewBox.width / 2,
  cy: viewBox.height / 2,
  radius: unitSize.value / 2,
})

type Pos = { x: number, y: number }
const draggingCircle = ref<RespondentCircle>()
const startPosition = ref({ circle: { x: 0, y: 0 }, mouse: { x: 0, y: 0 } })
const hoverIndex = ref(-1)

const svg = ref<SVGElement>()
function mousePosToSvgPos (p: Pos) {
  const bb = svg.value.getBoundingClientRect()
  return {
    x: (p.x - bb.left) * viewBox.width / bb.width,
    y: (p.y - bb.top) * viewBox.height / bb.height,
  }
}

const ringCenter = { x: viewBox.width * (3 / 4), y: viewBox.height / 2 }
const rings = computed<{ cx: number, cy: number, r: number}[]>(() => props.config.rings.map((_, i) => {
  return {
    cx: ringCenter.x,
    cy: ringCenter.y,
    r: (props.config.rings.length + 0.5 - i) * unitSize.value,
  }
}))

function startDrag (index: number, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  console.log('start drag', index)
  startPosition.value.mouse = mousePosToSvgPos({ x: event.clientX, y: event.clientY })
  startPosition.value.circle = { x: respondents.value[index].cx, y: respondents.value[index].cy }
  draggingCircle.value = respondents.value[index]
}

function updateDragginPos (mousePos: Pos) {
  if (draggingCircle.value) {
    draggingCircle.value.cx = startPosition.value.circle.x + mousePos.x - startPosition.value.mouse.x
    draggingCircle.value.cy = startPosition.value.circle.y + mousePos.y - startPosition.value.mouse.y
  }
}

const maxRingRadius = (props.config.rings.length - 0.5) * unitSize.value
function mouseMove (event: MouseEvent) {
  if (draggingCircle.value) {
    const mouse = mousePosToSvgPos({ x: event.clientX, y: event.clientY })
    updateDragginPos(mouse)
    const dx = ringCenter.x - mouse.x
    const dy = ringCenter.y - mouse.y
    const radius = Math.sqrt(dx * dx + dy * dy)
    console.log('radius', radius, maxRingRadius)
    let ring = null
    // check rings in reverse order
    for (let i = rings.value.length; i--; i > -1) {
      if (radius <= rings.value[i].r) {
        ring = i
        break
      }
    }
    draggingCircle.value.ring = ring
  }
}

function stopDrag (event: MouseEvent) {
  console.log('stopDrag')
  if (draggingCircle.value) {
    const mouse = mousePosToSvgPos({ x: event.clientX, y: event.clientY })
    // TODO: assign them to a ring position if they're in one or return them to their original position
    updateDragginPos(mouse)
    if (draggingCircle.value.ring !== null && draggingCircle.value.ring !== undefined) {
      // Reset the grid if they were put in a ring
      alignGrid()
      emit('rings', respondents.value.reduce((acc, r) => {
        if (r.ring !== null && r.ring !== undefined) {
          acc[r.respondent.id] = props.config.rings[r.ring].varName
        }
        return acc
      }, {} as Record<string, string>))
    } else {
      // Return them to their original position in the grid
      draggingCircle.value.cx = startPosition.value.circle.x
      draggingCircle.value.cy = startPosition.value.circle.y
    }
    draggingCircle.value = null
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
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @mousemove="mouseMove"
  >
    <!-- RINGS -->
    <circle
      v-for="(ring, i) in rings"
      :key="i"
      :cx="ring.cx"
      :cy="ring.cy"
      fill="lightgrey"
      stroke="grey"
      stroke-width="1"
      class="ring"
      :class="{ active: draggingCircle && draggingCircle.ring === i }"
      :r="ring.r"
    />
    <text
      v-for="(ring, i) in props.config.rings"
      :key="ring.varName"
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
        style="clip-path: inset(0 0 0 0 round 50%);"
      />
    </g>

    <!-- Respondents -->
    <g
      v-for="(r, i) in respondents"
      :key="r.id"
      :transform="`translate(${r.cx}, ${r.cy})`"
      :class="{ inring: r.ring !== null && r.ring !== undefined && r !== draggingCircle }"
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
        @mousedown="startDrag(i, $event)"
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
  .inring
    display: none
</style>
