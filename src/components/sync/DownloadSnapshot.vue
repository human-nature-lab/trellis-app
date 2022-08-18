<template>
  <v-col>
    <v-row
      v-for="step in steps"
      :key="step.name"
      no-gutters
    >
      <v-icon>mdi-step</v-icon>
      <span>{{ step.name }}</span>
    </v-row>
    <v-row
      no-gutters
    >
      <v-spacer />
      <v-btn @click="cancel">
        {{ $t('cancel') }}
      </v-btn>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { TranslateResult } from 'vue-i18n'
import { Controller } from '@/modules/sync/'
import { CheckDownloadSize } from '@/modules/sync/download/check-download-size'

export default Vue.extend({
  name: 'DownloadSnapshot',
  data () {
    return {
      steps: [new CheckDownloadSize()],
      ctrl: null,
    }
  },
  methods: {
    async start () {
      this.ctrl = new Controller(this.confirm)
      const data: Record<string, any> = {}
      for (const step of this.steps) {
        const res = await this.ctrl.run(data, step)
        if (res.data) {
          Object.assign(data, res.data)
        }
      }
    },
    async confirm (msg: string | TranslateResult, color = 'warn') {
      return confirm(msg.toString())
    },
    async cancel () {
      if (this.ctrl) {
        this.ctrl.cancel()
      }
    },
  },
})
</script>

<style lang="sass">

</style>
