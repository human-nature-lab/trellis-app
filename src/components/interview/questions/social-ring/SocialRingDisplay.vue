<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVuetify } from '@/helpers/vuetify.helper'

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
  showRingText: boolean
}

export type PartialRespondent = {
  id: string
  name: string
  avatarSrc: string
}
const props = defineProps<{
  value: Record<string, string | number> // Map of respondent id to ring varName
  ego: PartialRespondent
  config: SocialRingConfig
  respondents: PartialRespondent[]
}>()

const emit = defineEmits<{
  (event: 'change-ring', respondentId: string, ring: Ring, duringReview: boolean): void
}>()

const $vuetify = useVuetify()
const scale = ref(0.5)
const unitSize = computed(() => scale.value * 130)
const aspectRatio = 1 // w/h
const height = 900
const viewBox = ref({ width: aspectRatio * height, height })

const ringRadius = computed(() => {
  return (props.config.rings.length + 1) * unitSize.value
})
const ringCenter = computed(() => {
  return {
    x: viewBox.value.width / 2,
    y: ringRadius.value + 2 * unitSize.value,
  }
})

type RespondentCircle = {
  respondent: PartialRespondent
  cx: number
  cy: number
  radius: number
  lastTouchedAt: number
}

function hasRing (respondentId: string) {
  return props.value[respondentId] !== undefined
}

const respondents = ref<RespondentCircle[]>(props.respondents.map(respondent => {
  return { respondent, cx: unitSize.value, cy: unitSize.value, radius: unitSize.value / 2, lastTouchedAt: 0 }
}))
const allRespondentsInRing = computed(() => respondents.value.every(r => hasRing(r.respondent.id)))

const ringDistribution = computed(() => {
  const rings = {}
  for (const r of respondents.value) {
    if (hasRing(r.respondent.id)) {
      const ring = props.value[r.respondent.id]
      const ringIndex = props.config.rings.findIndex(r => r.varName === ring)
      if (!rings[ringIndex]) {
        rings[ringIndex] = 0
      }
      rings[ringIndex]++
    }
  }
  return rings
})

const ringOffsets = ref(props.config.rings.map(() => Math.random() * Math.PI))

function fixRing () {
  const ringCount = Array.from({ length: props.config.rings.length }, () => 0)
  for (let i = 0; i < respondents.value.length; i++) {
    const r = respondents.value[i]
    if (hasRing(r.respondent.id)) {
      const ringVarName = props.value[r.respondent.id]
      const ringIndex = props.config.rings.findIndex(r => r.varName === ringVarName)
      const ringTotal = ringDistribution.value[ringIndex]
      const ringPosition = ringCount[ringIndex]
      const ringRadius = (ringIndex + 1) * unitSize.value
      const offset = ringOffsets.value[ringIndex]
      r.cx = ringCenter.value.x + ringRadius * Math.cos(offset + ringPosition * 2 * Math.PI / ringTotal)
      r.cy = ringCenter.value.y + ringRadius * Math.sin(offset + ringPosition * 2 * Math.PI / ringTotal)
      r.radius = unitSize.value / 2
      ringCount[ringIndex]++
    }
  }
}

watch(() => [props.value, props.respondents], () => {
  fixRing()
}, { immediate: true })

const currentRespondent = computed(() => {
  return respondents.value.find(r => !hasRing(r.respondent.id))
})

const egoCircle = ref<RespondentCircle>({
  respondent: props.ego,
  cx: viewBox.value.width / 2,
  cy: viewBox.value.height / 2,
  radius: unitSize.value / 2,
  lastTouchedAt: 0,
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

type ViewRing = { index: number, cx: number, cy: number, r: number, varName: string }
const rings = computed(() => props.config.rings.slice().reverse().map((_, i) => {
  const index = props.config.rings.length - i - 1
  return {
    index,
    cx: ringCenter.value.x,
    cy: ringCenter.value.y,
    r: (props.config.rings.length + 0.5 - i) * unitSize.value,
    varName: props.config.rings[index].varName,
  } as ViewRing
}))

function startDrag (respondent: RespondentCircle, pos: Pos) {
  startPosition.value.mouse = pos
  startPosition.value.circle = { x: respondent.cx, y: respondent.cy }
  draggingCircle.value = respondent
  draggingRing.value = null
}

function canDrag (respondent: RespondentCircle) {
  return !hasRing(respondent.respondent.id) || (props.config.allowFinalReview && allRespondentsInRing.value)
}

function startDragMouse (respondent: RespondentCircle, event: MouseEvent) {
  respondent.lastTouchedAt = Date.now()
  if (!canDrag(respondent)) return
  event.preventDefault()
  event.stopPropagation()
  return startDrag(respondent, absPosToSvgPos({ x: event.clientX, y: event.clientY }))
}

function startDragTouch (respondent: RespondentCircle, event: TouchEvent) {
  respondent.lastTouchedAt = Date.now()
  if (!canDrag(respondent)) return
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
      ring = rings.value[i].index
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
  updateDragginPos(pos)
  if (draggingRing.value !== null) {
    // Reset the grid if they were put in a ring
    const r = draggingCircle.value
    emit('change-ring', r.respondent.id, props.config.rings[draggingRing.value], allRespondentsInRing.value)
    fixRing()
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
const darkTheme = computed(() => $vuetify.theme.dark)
const invertedColor = computed(() => darkTheme.value ? 'white' : 'black')
const themeColor = computed(() => darkTheme.value ? 'black' : 'white')
function respondentHidden (r: RespondentCircle) {
  if (allRespondentsInRing.value || currentRespondent.value === r) {
    return false
  }
  return hasRing(r.respondent.id) ? props.config.hideAfterMove : true
}

const remainingRespondentCount = computed(() => {
  return respondents.value.filter(r => !hasRing(r.respondent.id)).length
})

// SVG renders in the order things are drawn so we need to sort the respondents how we want them to appear on the screen
// this is manual z-indexing
const zRespondents = computed(() => {
  const order = respondents.value.slice()
  order.sort((a, b) => {
    return a.lastTouchedAt - b.lastTouchedAt
  })
  return order
})
</script>

<template>
  <v-row class="no-gutters justify-center">
    <svg
      ref="svg"
      id="social-ring"
      :class="{ dark: darkTheme }"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${viewBox.width} ${viewBox.height}`"
      @mouseup="stopDragMouse"
      @mouseleave="stopDragMouse"
      @mousemove="dragMoveMouse"
      @touchmove="dragMoveTouch"
      @touchend="stopDragTouch"
    >
      <text
        v-if="remainingRespondentCount > 0"
        :x="viewBox.width"
        :y="unitSize"
        :fill="invertedColor"
        :stroke="invertedColor"
        :font-size="unitSize / 3"
        text-anchor="end"
        dominant-baseline="middle"
      >
        {{ $t('remaining_respondents_n', [remainingRespondentCount]) }}
      </text>

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
        :class="{ active: draggingCircle && draggingRing === ring.index }"
        :r="ring.r"
      />
      <text
        v-for="ring in rings"
        :key="`label-${ring.varName}`"
        :x="ring.cx"
        :y="ring.cy - (ring.r - 22)"
        :font-size="18"
        fill="black"
        stroke="black"
        text-anchor="middle"
        :class="{ hidden: !props.config.showRingVarName }"
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
        v-for="(r, i) in zRespondents"
        :key="`respondent-${r.respondent.id}`"
        :transform="`translate(${r.cx}, ${r.cy})`"
        :class="{ hidden: respondentHidden(r) }"
      >
        <circle
          :r="r.radius"
          :fill="i === hoverIndex ? 'red' : invertedColor"
          class="respondent"
        />
        <image
          class="respondent-avatar"
          :class="{ dragging: draggingCircle === r, draggable: canDrag(r) }"
          :href="r.respondent.avatarSrc"
          :width="(r.radius - imageBorder) * 2"
          :height="(r.radius - imageBorder) * 2"
          :x="-(r.radius - imageBorder)"
          :y="-(r.radius - imageBorder)"
          style="clip-path: inset(0 0 0 0 round 50%);"
          @mouseenter="hoverIndex = i"
          @mouseleave="hoverIndex = -1"
          @mousedown="startDragMouse(r, $event)"
          @touchstart="startDragTouch(r, $event)"
        />
        <text
          v-if="!hasRing(r.respondent.id) || i === zRespondents.length - 1"
          :x="hasRing(r.respondent.id) ? 0 : 2 * (r.radius + imageBorder)"
          :y="hasRing(r.respondent.id) ? -unitSize : 0"
          :fill="invertedColor"
          :stroke="themeColor"
          :font-size="unitSize / 2"
          font-weight="bold"
          :text-anchor="hasRing(r.respondent.id) ? 'middle' : 'start'"
          dominant-baseline="middle"
        >
          {{ r.respondent.name }}
        </text>
      </g>
    </svg>
  </v-row>
</template>

<style lang="sass">
#social-ring
  width: 100%
  height: 100%
  max-height: 900px
  max-width: 900px
  margin: auto
  .ring
    transition: all 0.5s ease-in-out
    &.active
      fill: yellow
  .respondent-avatar
    transition: all 0.5s ease-in-out
    &.draggable:hover
      cursor: grab
    &.dragging
      cursor: grabbing
  .hidden
    display: none
  text
    pointer-events: none
</style>
