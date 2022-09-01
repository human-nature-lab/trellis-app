<template>
  <v-stepper
    v-if="groups.length"
    v-model="group"
  >
    <v-stepper-header>
      <template v-for="(g, index) in groups">
        <v-stepper-step
          :key="g.id"
          :step="index + 1"
          :complete="group > index + 1"
        >
          {{ g.title }}
        </v-stepper-step>
        <v-divider
          v-if="index !== groups.length - 1"
          :key="g.id + 'divider'"
        />
      </template>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content
        v-for="(g, index) in groups"
        :key="g.id"
        :step="index + 1"
      >
        <v-subheader>{{ g.title }}</v-subheader>
        <v-list>
          <v-list-item
            v-for="(step, stepIndex) in g.steps"
            :key="'' + g.id + step.title"
            no-gutters
          >
            <v-list-item-avatar>
              <v-icon v-if="stepIndex > activeStep">
                mdi-clock
              </v-icon>
              <v-icon
                v-else-if="stepIndex < activeStep"
                color="success"
              >
                mdi-check
              </v-icon>
              <v-icon
                v-else-if="error"
                color="error"
              >
                mdi-alert-circle
              </v-icon>
              <v-icon
                v-else-if="cancelled"
                color="warning"
              >
                mdi-alert
              </v-icon>
              <v-icon
                v-else-if="stepIndex === activeStep"
                class="anim-rotate"
              >
                mdi-cog
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ step.title }}</v-list-item-title>
              <div v-if="step.message">
                {{ step.message.value }}
              </div>
              <v-alert
                v-if="stepIndex === activeStep && message"
                outlined
                :type="message.color"
              >
                {{ message.msg }}
              </v-alert>
              <v-alert
                v-else-if="stepIndex === activeStep && error"
                outlined
                type="error"
              >
                {{ error }}
              </v-alert>
              <v-row
                v-if="progress && progress.total && !error && stepIndex === activeStep"
                class="align-center"
              >
                <v-col>
                  <v-progress-linear
                    :value="100 * (progress.value / progress.total)"
                  />
                </v-col>
                <v-col cols="4">
                  <span v-if="progress.showValue">{{ progress.value }} / {{ progress.total }}</span>
                  <span v-else>
                    {{ (100 * progress.value / progress.total).toFixed(0) }}%
                  </span>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-stepper-content>
    </v-stepper-items>
    <slot name="footer">
      <v-row
        no-gutters
        class="pa-4"
      >
        <v-btn
          v-if="startedOnce"
          @click="restart"
          :disabled="running"
        >
          {{ $t('restart') }}
        </v-btn>
        <v-spacer />
        <v-btn
          :disabled="!startedOnce"
          @click="cancel"
        >
          {{ running ? $t('cancel') : $t('stop') }}
        </v-btn>
      </v-row>
    </slot>
    <ConfirmationDialog ref="confirmation">
      <v-alert
        outlined
        :type="confirmationType"
      >
        {{ confirmationMessage }}
      </v-alert>
    </ConfirmationDialog>
  </v-stepper>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { delay } from '@/classes/delay'
import { Controller } from '@/modules/sync'
import { Stringable } from '@/modules/sync/controller'
import ConfirmationDialog from './ConfirmationDialog.vue'

export type DisplayStep = {
  title: Stringable
  status?: string
  message?: {
    value: Stringable
    color?: 'success' | 'error' | 'warn'
  }
}

type Group = {
  id: number
  title: Stringable
  steps: DisplayStep[]
}

type Message = {
  msg: Stringable
  color: string
}

type Progress = {
  value: number
  total: number
  showValue: boolean
}

export default Vue.extend({
  name: 'SyncStepper',
  components: { ConfirmationDialog },
  props: {
    start: Function as PropType<(ctrl: Controller) => Promise<void>>,
  },
  data () {
    return {
      running: false,
      startedOnce: false,
      cancelled: false,
      group: 0,
      error: null as string,
      message: null as Message,
      activeStep: -1,
      progress: null as Progress,
      randId: 1,
      isDone: true,
      randGroupId: 1,
      groups: [] as Group[],
      ctrl: null as Controller,
      confirmationType: 'warn',
      confirmationMessage: '' as Stringable,
    }
  },
  created () {
    this.setup()
    this._start()
  },
  beforeDestroy () {
    if (!this.isDone) {
      this.cancel()
    }
  },
  methods: {
    setup () {
      this.randId++
      this.error = null
      this.message = null
      this.progress = null
      this.groups = []
      this.group = 1
      this.cancelled = false
      this.activeStep = -1
      this.ctrl = new Controller(this)
    },
    async restart () {
      this.running = true
      this.setup()
      this.$nextTick(this._start)
    },
    async _start () {
      this.startedOnce = true
      this.running = true
      try {
        await this.start(this.ctrl)
      } catch (err) {
        console.error(err)
        this.error = '' + err
        // this.groups[this.group - 1].steps[this.activeStep].message = {
        //   value: err.message,
        //   color: 'error',
        // }
      } finally {
        this.running = false
      }
    },
    async done () {
      this.activeStep = this.groups[this.group - 1].steps.length + 1
      await delay(4000)
      this.isDone = true
      this.$emit('done')
    },
    addGroup (title: Stringable): number {
      this.randGroupId++
      this.groups.push({
        id: this.randId + this.randGroupId,
        title,
        steps: [],
      })
      return this.groups.length - 1
    },
    setGroup (id: number) {
      this.group = id + 1
      this.activeStep = -1
    },
    addStep (groupId: number, title: Stringable) {
      this.groups[groupId].steps.push({
        title,
      })
      return this.groups[groupId].steps.length - 1
    },
    setStep (id: number) {
      this.progress = null
      this.activeStep = id
    },
    setMessage (msg: Stringable, color = 'warning') {
      this.message = { msg, color }
    },
    async confirm (msg: Stringable, color = 'warning') {
      this.confirmationMessage = msg
      this.confirmationType = color
      const el = (this.$refs.confirmation as unknown) as { confirm (): Promise<boolean> }
      return el.confirm()
    },
    async cancel () {
      this.cancelled = true
      const wasRunning = this.running
      this.running = false
      if (this.ctrl) {
        this.ctrl.cancel()
      }
      if (!wasRunning) {
        this.$emit('cancel')
      }
    },
    async setProgress (value: number, total: number, showValue = false) {
      this.progress = { value, total, showValue }
    },
  },
})
</script>

<style lang="sass" scoped>
  .anim-rotate
    animation: rotate linear infinite 1s

@keyframes rotate
  0%
    transform: rotate(0deg)
  50%
    transform: rotate(180deg)
  100%
    transform: rotate(360deg)
</style>
