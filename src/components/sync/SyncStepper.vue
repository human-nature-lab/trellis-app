<template>
  <v-stepper
    :value="value"
    @change="$emit('input', $event)"
  >
    <v-stepper-header>
      <template v-for="(g, index) in groups">
        <v-stepper-step
          :key="g.title"
          :step="index + 1"
          :complete="value > index + 1"
        >
          {{ g.title }}
        </v-stepper-step>
        <v-divider
          v-if="index !== groups.length - 1"
          :key="g.title + 'divider'"
        />
      </template>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content
        v-for="(g, index) in groups"
        :key="g.title"
        :step="index + 1"
      >
        <v-subheader>{{ g.title }}</v-subheader>
        <v-list>
          <v-list-item
            v-for="(step, index) in g.steps"
            :key="step.name"
            no-gutters
          >
            <v-list-item-avatar>
              <v-icon
                v-if="step.status === 'success'"
                color="success"
              >
                mdi-check
              </v-icon>
              <v-icon v-else-if="step.status === 'pending'">
                mdi-clock
              </v-icon>
              <v-icon
                v-else-if="step.status === 'error'"
                color="error"
              >
                mdi-alert-circle
              </v-icon>
              <v-progress-circular
                v-else-if="step.status === 'running'"
                :size="26"
                :width="2"
                indeterminate
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ step.name }}</v-list-item-title>
              <div v-if="step.message">
                {{ step.message.value }}
              </div>
              <v-progress-linear
                v-if="progress && !progress.indeterminate && index === activeStep"
                :value="100 * progress.value / progress.total"
              />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-stepper-content>
    </v-stepper-items>
    <slot name="footer" />
  </v-stepper>
</template>

<script lang="ts">
import { delay } from '@/classes/delay'
import { Controller } from '@/modules/sync'
import { Pipeline } from '@/modules/sync/pipe'
import SyncService from '@/services/SyncService'
import Vue, { PropType } from 'vue'
import { TranslateResult } from 'vue-i18n'

export type DisplayStep = {
  name: string
  status?: string
  message?: {
    value: string
    color?: 'success' | 'error' | 'warn'
  }
}

type Group = {
  title: string
  pipe: Pipeline<any, any, Controller, DisplayStep>
}

type Progress = {
  indeterminate: boolean
  value: number
  total: number
}

export default Vue.extend({
  name: 'SyncStepper',
  props: {
    value: Number,
    groups: Array as PropType<Group[]>,
  },
  data () {
    return {
      running: false,
      startedOnce: false,
      group: 0,
      activeStep: -1,
      progress: {
        indeterminate: true,
        value: 0,
        total: 0,
      },
      pipeData: {} as any,
      displayGroups: [] as {
          title: string;
          steps: DisplayStep[];
      }[],
      ctrl: null as Controller,
    }
  },
  methods: {
setup () {
      this.group = 1
      this.ctrl = new Controller(this.confirm, this.setProgress)
      this.displayGroups = this.groups.map(g => ({
        title: g.title,
        steps: g.pipe.segments().map((s, i) => Object.assign({ status: 'pending' }, s.segmentData)),
      }))
    },
    async restart () {
      this.running = true
      this.setup()
      await delay(1000)
      this.start()
    },
    async start () {
      this.startedOnce = true
      this.running = true
      const deviceId = await DeviceService.getUUID()
      const sync = await SyncService.createSync('download', deviceId)
      try {
        this.group = 1
        this.pipeData = await this.runPipe(this.pipeData, connectingPipe, this.displayGroups[0])
        this.group++
        this.pipeData = await this.runPipe(this.pipeData, downloadingPipe, this.displayGroups[1])
        this.group++
        this.pipeData.sync = sync
        this.pipeData = await this.runPipe(this.pipeData, replacingPipe, this.displayGroups[2])
        await delay(1000)
        this.$emit('onDone', sync)
      } catch (err) {
        await SyncService.registerCancelledSync(sync)
      }
    },
    async runPipe<T, R> (input: T, pipe: Pipeline<T, R, Controller, DisplayStep>, displayGroup) {
      pipe.clearHooks()
      pipe.beforeEach.add((_, i) => {
        this.ctrl.onCancel.clear()
        this.activeStep = i
        const dStep = displayGroup.steps[i]
        dStep.status = 'running'
      })
      pipe.afterEach.add((input, output, i) => {
        this.progress.indeterminate = true
        this.progress.value = 1
        this.progress.total = 1
        const dStep = displayGroup.steps[i]
        console.log('res', input, output, dStep.name)
        dStep.status = 'success'
      })
      pipe.onError.add((err, i) => {
        const dStep = displayGroup.steps[i]
        dStep.status = 'error'
        dStep.message = {
          value: err.message,
        }
        this.running = false
      })
      return pipe.run(input, this.ctrl)
    },
    async confirm (msg: string | TranslateResult, color = 'warn') {
      return confirm(msg.toString())
    },
    async cancel () {
      const wasRunning = this.running
      this.running = false
      if (this.ctrl) {
        this.ctrl.cancel()
      }
      if (!wasRunning) {
        this.$emit('onDone')
      }
    },
    async setProgress (progress: number, total: number) {
      this.progress.indeterminate = false
      this.progress.value = progress
      this.progress.total = total
    },
  }
})
</script>

<style lang="sass">

</style>
