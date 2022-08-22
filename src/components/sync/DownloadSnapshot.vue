<template>
  <v-col>
    <SyncStepper
      v-model="group"
      :groups="displayGroups"
      :active-step="activeStep"
      :progress="progress"
    >
      <template #footer>
        <v-row
          class="pa-4"
          no-gutters
        >
          <v-btn
            v-if="startedOnce"
            @click="restart"
            :disabled="running"
          >
            {{ $t('restart') }}
          </v-btn>
          <v-btn
            v-else
            @click="start"
          >
            {{ $t('start') }}
          </v-btn>
          <v-spacer />
          <v-btn
            @click="cancel"
          >
            {{ running ? $t('cancel') : $t('exit') }}
          </v-btn>
        </v-row>
      </template>
    </SyncStepper>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { TranslateResult } from 'vue-i18n'
import { Controller } from '@/modules/sync/'
import { checkConnection, authenticateDevice } from '@/modules/sync/common'
import {
  checkDownloadSize,
  checkLatestSnapshot,
  closeDatabase,
  compareDownload,
  compareTime,
  compareUpload,
  configureDatabase,
  downloadSnapshot,
  emptySnapshotDirectory,
  extractSnapshot,
  moveDatabase,
  registerDownload,
  removeDatabase,
  verifyDownload,
} from '@/modules/sync/download'
import SyncStepper, { DisplayStep } from './SyncStepper.vue'
import { Pipeline } from '@/modules/sync/pipe'
import { delay } from '@/classes/delay'
import { Snapshot } from '@/modules/sync/types'
import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import Sync from '@/entities/trellis-config/Sync'

const connectingPipe = new Pipeline<void, void, Controller, DisplayStep>()
connectingPipe
  .then(checkConnection, { name: 'Check connection' })
  .then(authenticateDevice, { name: 'Authenticate device' })
  .then(compareTime, { name: 'Compare server time' })
  .then(checkLatestSnapshot, { name: 'Check latest snapshot' })
  .then(compareDownload, { name: 'Compare download' })
  .then(compareUpload, { name: 'Compare upload' })
const downloadingPipe = new Pipeline<{ snapshot: Snapshot }, void, Controller, DisplayStep>()
downloadingPipe
  .then(emptySnapshotDirectory, { name: 'Empty snapshot directory' })
  .then(checkDownloadSize, { name: 'Check download size' })
  .then(downloadSnapshot, { name: 'Download snapshot' })
  .then(verifyDownload, { name: 'Verify download' })
  .then(extractSnapshot, { name: 'Extract snapshot' })
const replacingPipe = new Pipeline<{ snapshot: Snapshot, sync: Sync }, void, Controller, DisplayStep>()
replacingPipe
  .then(closeDatabase, { name: 'Close database' })
  .then(removeDatabase, { name: 'Remove database' })
  .then(moveDatabase, { name: 'Move database' })
  .then(configureDatabase, { name: 'Configure database' })
  .then(registerDownload, { name: 'Register download' })

export default Vue.extend({
  name: 'DownloadSnapshot',
  data () {
    return {
      stepGroups: [{
        title: this.$t('connecting'),
        pipe: connectingPipe,
      }, {
        title: this.$t('downloading'),
        pipe: downloadingPipe,
      }, {
        title: this.$t('replacing'),
        pipe: replacingPipe,
      }],
      group: 1,
      activeStep: -1,
      displayGroups: [] as {
          title: string;
          steps: DisplayStep[];
      }[],
      ctrl: null as Controller,
      startedOnce: false,
      running: false,
      progress: {
        indeterminate: true,
        value: 0,
        total: 0,
      },
      pipeData: {} as any,
    }
  },
  created () {
    this.setup()
  },
  methods: {
    setup () {
      this.group = 1
      this.ctrl = new Controller(this.confirm, this.setProgress)
      this.displayGroups = this.stepGroups.map(g => ({
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
  },
  components: { SyncStepper },
})
</script>

<style lang="sass">

</style>
