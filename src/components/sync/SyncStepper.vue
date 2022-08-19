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
import Vue, { PropType } from 'vue'

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
  steps: DisplayStep[]
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
    activeStep: Number,
    progress: Object as PropType<Progress>,
  },
})
</script>

<style lang="sass">

</style>
