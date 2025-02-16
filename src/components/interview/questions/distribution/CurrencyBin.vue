<script setup lang="ts">
import { computed } from 'vue'
import { useMemoize } from '@/hooks/useMemoize'
import { Bin } from '@/lib/distribution/bin'
import { HNLCurrency } from '@/lib/currency/hnl'
import { USDCurrency } from '@/lib/currency/usd'
import { computeChange } from '@/lib/currency/Currency'
import { random } from 'lodash'

const props = defineProps<{
  closed: boolean
  value: number
  bin: Bin
  currency: 'hnl' | 'usd'
}>()

HNLCurrency.denominations = HNLCurrency.denominations.filter(d => [1, 5, 10, 20, 100].includes(d.value))

const currency = computed(() => {
  return props.currency === 'hnl' ? HNLCurrency : USDCurrency
})

const memoChange = useMemoize(computeChange)

const change = computed(() => {
  return memoChange(Math.round(props.value), currency.value)
})

const dxBill = 3
const dxDenom = 8
const dy = -4

const cacheId = random(10)
const getBills = useMemoize((padding: typeof props.bin.padding, c: typeof change.value) => {
  const res = []
  let yOffset = ((padding && padding.top) ? padding.top : 0) + 100
  let xOffset = ((padding && padding.left) ? padding.left : 0) + 18
  for (let j = 0; j < c.length; j++) {
    const denomination = c[j]
    for (let i = 0; i < denomination.count; i++) {
      xOffset += dxBill
      res.push({
        src: denomination.denomination.imageSrc,
        xOffset,
        yOffset,
      })
    }
    yOffset += dy
    xOffset += dxDenom
  }
  return res
}, (padding: typeof props.bin.padding, c: typeof change.value) => {
  const paddingKey = padding ? `${padding.top}-${padding.left}` : ''
  return `${cacheId}-${paddingKey}-${c.map(d => `${d.denomination}${d.count}`).join('')}`
})
const bills = computed(() => {
  return getBills(props.bin.padding, change.value)
})
</script>

<template>
  <v-col>
    <h2 class="text-center mb-4">
      {{ Math.round(value) }}
    </h2>
    <div
      v-if="closed"
      class="bin-container mx-auto"
    >
      <div
        class="background"
      >
        <img :src="bin.closed.backSrc">
      </div>
      <!-- <div class="currency">
        <img
          v-for="(bill, index) in bills"
          :key="index"
          class="bill"
          :style="{ transform: `translate(${bill.xOffset}%, ${bill.yOffset}%) rotateZ(-85deg)`}"
          :src="bill.src"
        >
      </div> -->
      <div
        class="foreground"
        v-if="bin.closed.frontSrc"
      >
        <img :src="bin.closed.frontSrc">
      </div>
    </div>
    <div
      v-else
      class="bin-container mx-auto"
    >
      <div
        class="background"
      >
        <img :src="bin.open.backSrc">
      </div>
      <div class="currency">
        <img
          v-for="(bill, index) in bills"
          :key="index"
          class="bill"
          :style="{ transform: `translate(${bill.xOffset}%, ${bill.yOffset}%) rotateZ(-85deg)`}"
          :src="bill.src"
        >
      </div>
      <div
        class="foreground"
        v-if="bin.open.frontSrc"
      >
        <img :src="bin.open.frontSrc">
      </div>
    </div>
  </v-col>
</template>

<style lang="sass">
  .bin-container
    position: relative
    width: 100%
    max-width: 300px
    z-index: 0
    img
      max-width: 100%
      width: 100%
    .foreground, .currency
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
    .foreground
      z-index: 10
    .bill
      position: absolute
      top: 0
      left: -70px
      width: 70%
      box-shadow: 3px 3px 6px 4px rgba(0, 0, 0, 0.5)
      // transform: rotateZ(85deg)
</style>
