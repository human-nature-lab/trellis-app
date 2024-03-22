<script setup lang="ts">
import { ref, onBeforeUnmount, onBeforeMount, computed, watch } from 'vue'
import { shuffle } from 'lodash'
import TrellisModal from '@/components/TrellisModal.vue'
import PreviousReports from './PreviousReports.vue'
import ReportTable from './ReportTable.vue'
import StatusChip from './StatusChip.vue'
import { Message, CandidatesRequest, CandidatesResponse, Device, Decision, Actor, Pair, DBActor, DeviceDecision } from './common'
import { Server, ServerSocket } from '@/services/nearby-communications/server'
import { onBeforeUnload } from '@/helpers/window.helper'
import { reactiveSet } from '@/lib/reactive-set'
import { useReports, Report } from './useReports'
import { watchRespondents } from '@/helpers/respondent.helper'

const props = defineProps<{
  serviceId: string
  formId: string
  deviceId: string
  deviceName: string
}>()

type Conn = {
  device: Device,
  decisions: Decision[],
  actor: Actor,
}

const server = ref<Server>()
const localConn = ref<Conn>({
  device: {
    deviceId: props.deviceId,
    deviceName: props.deviceName,
  },
  decisions: [],
  actor: new DBActor(),
})

const { reports, loading: reportsLoading, pushReport, error: reportsErr } = useReports(props.formId, props.deviceId)

watch(() => reports.value, () => {
  console.log('reports', reports.value)
}, { immediate: true })

const connections = ref<Record<string, Conn>>({})
const deviceActors = computed(() => {
  const actorMap: Record<string, Actor> = { local: localConn.value.actor }
  for (const conn of Object.values(connections.value)) {
    if (conn.device) {
      actorMap[conn.device.deviceId] = conn.actor
    }
  }
  return actorMap
})

class SocketActor implements Actor {
  constructor (private socket: ServerSocket) {}

  async getDecisions (formId: string): Promise<Decision[]> {
    return this.socket.request<CandidatesRequest, CandidatesResponse>(
      Message.Candidates,
      { formId } as CandidatesRequest,
    )
  }

  async startSave (pairs: Pair[]): Promise<void> {
    return this.socket.request(Message.StartPairs, { pairs })
  }

  async completeSave (): Promise<void> {
    return this.socket.request(Message.CompleteTx)
  }

  async rollbackSave (): Promise<void> {
    return this.socket.request(Message.RollbackTx)
  }
}

const allDecisions = computed(() => {
  const decisions = [] as DeviceDecision[]
  for (const decision of localConn.value.decisions) {
    decisions.push({
      ...decision,
      deviceId: 'local',
      isLocal: true,
    })
  }
  for (const socketId in connections.value) {
    const conn = connections.value[socketId]
    for (const decision of conn.decisions) {
      decisions.push({
        ...decision,
        deviceId: conn.device.deviceId,
      })
    }
  }
  return decisions
})

const { respondents, loading, error: respondentsErr } = watchRespondents(() =>
  allDecisions.value.map(d => d.respondentId),
)

async function onConnection (socket: ServerSocket) {
  console.log('onConnection', socket.connection)
  socket.onDisconnect.add(() => {
    console.log('disconnect', socket.connection)
    delete connections.value[socket.id]
    connections.value = { ...connections.value }
  })
  socket.on(Message.Hello, async (device: Device) => {
    console.log('hello', device)
    const actor = new SocketActor(socket)
    connections.value[socket.id] = {
      device,
      decisions: [],
      actor,
    }
    connections.value = { ...connections.value }
    console.log('connections', JSON.stringify(connections.value))
    const decisions = await actor.getDecisions(props.formId)
    console.log('decisions', decisions)
    const conn = connections.value[socket.id]
    if (!conn) {
      throw new Error('No connection found for socket: ' + socket.id)
    }
    conn.decisions = decisions
  })
}

onBeforeMount(async () => {
  server.value = new Server(props.deviceName, props.serviceId, 'star')
  server.value.onConnection.add(onConnection)
  await server.value.connect()
  localConn.value.decisions = await localConn.value.actor.getDecisions(props.formId)
})

async function disconnect () {
  if (server.value) {
    await server.value.disconnect()
  }
}

onBeforeUnmount(disconnect)
onBeforeUnload(disconnect)

const selectedRespondents = reactiveSet<string>()

function toggleSelectedRespondent (respondentId: string) {
  if (selectedRespondents.has(respondentId)) {
    selectedRespondents.delete(respondentId)
  } else {
    selectedRespondents.add(respondentId)
  }
}

const report = ref<Report>(null)
const showReport = ref(false)
const working = ref(false)
const execErr = ref()

async function generateRing () {
  execErr.value = null
  const respondentDecisions = new Map<string, DeviceDecision>()
  for (const decision of allDecisions.value) {
    if (selectedRespondents.has(decision.respondentId)) {
      respondentDecisions.set(decision.respondentId, decision)
    }
  }
  const respIds = shuffle(Array.from(respondentDecisions.keys()))
  const pairs = respIds.map((respId, i) => {
    const nextRespId = respIds[(i + 1) % respIds.length]
    const decider = respondentDecisions.get(respId)
    const receiver = respondentDecisions.get(nextRespId)
    return {
      decider,
      receiver,
    }
  })

  report.value = {
    devices: Object.keys(deviceActors.value),
    rows: [],
  }
  const shuffledPairs = shuffle(pairs)
  for (const pair of shuffledPairs) {
    const kept = pair.decider.value
    const given = pair.receiver.max - pair.receiver.value
    report.value.rows.push({
      respondentId: pair.receiver.respondentId,
      pair,
      kept,
      given,
      total: kept + given,
    })
  }
  showReport.value = true
  console.log('pairs', shuffledPairs)
  console.log('report', report)
}

function reportDevicesHaveChanged (report: Report) {
  return report.devices.join(':') !== Object.keys(deviceActors.value).join(':')
}

function compareWithPreviousReports (report: Report) {
  const reportRespondents = report.rows.map(row => row.respondentId)
  reportRespondents.sort()
  for (const r of reports.value) {
    const rRespondents = r.report.rows.map(row => row.respondentId)
    rRespondents.sort()
    if (rRespondents.join(':') === reportRespondents.join(':')) {
      throw new Error('Report with the same respondents already exists')
    }
    for (const id of rRespondents) {
      if (reportRespondents.includes(id)) {
        throw new Error(`A respondent was in a previous report: ${id}`)
      }
    }
  }
}

async function synchronize () {
  compareWithPreviousReports(report.value)

  if (report.value.rows.length === 0) {
    throw new Error('No report to synchronize')
  }
  if (reportDevicesHaveChanged(report.value)) {
    throw new Error('Devices have changed since report was created')
  }

  // store the report in the database
  await pushReport(report.value)

  const pairs = report.value.rows.map(row => row.pair)
  const pairGroups = new Map<string, Pair[]>()
  for (const pair of pairs) {
    if (!pairGroups.has(pair.decider.deviceId)) {
      pairGroups.set(pair.decider.deviceId, [])
    }
    pairGroups.get(pair.decider.deviceId).push(pair)
  }

  console.log('pairGroups', pairGroups)

  if (reportDevicesHaveChanged(report.value)) {
    throw new Error('Devices changed after saving report')
  }
  const actors = []
  const promises = []
  try {
    for (const [deviceId, group] of pairGroups) {
      const actor = deviceActors.value[deviceId]
      if (!actor) {
        throw new Error('No actor found for device: ' + deviceId)
      }
      actors.push(actor)
      promises.push(actor.startSave(group))
    }
  } catch (err) {
    await Promise.all(actors.map(a => a.rollbackSave()))
    throw err
  }

  try {
    await Promise.all(promises)
  } catch (err) {
    await Promise.all(actors.map(a => a.rollbackSave()))
    throw err
  }

  if (reportDevicesHaveChanged(report.value)) {
    throw new Error('Devices changed after starting save')
  }
  // await Promise.all(actors.map(a => a.rollbackSave()))

  try {
    await Promise.all(actors.map(a => a.completeSave()))
    showReport.value = false
  } catch (err) {
    await Promise.all(actors.map(a => a.rollbackSave()))
    throw err
  }
}

async function exec (fn: () => any) {
  working.value = true
  try {
    await fn()
  } catch (err) {
    execErr.value = err
  } finally {
    working.value = false
  }
}

const err = computed(() => {
  return execErr.value || reportsErr.value || respondentsErr.value
})

const allSelected = computed(() => {
  return selectedRespondents.size === allDecisions.value.length
})

const someSelected = computed(() => {
  return selectedRespondents.size > 0 && !allSelected.value
})

function toggleSelectAll () {
  if (allSelected.value) {
    selectedRespondents.clear()
  } else {
    for (const decision of allDecisions.value) {
      selectedRespondents.add(decision.respondentId)
    }
  }
}

const showPrevReports = ref(false)

</script>

<template>
  <v-col>
    <v-row class="no-gutters">
      <h1>{{ $t('leader') }}</h1>
      <StatusChip :status="server.state" />
      <v-spacer />
      <v-btn @click="showPrevReports = true">
        {{ $t('reports') }}
      </v-btn>
      <v-btn @click="$emit('stop')">
        {{ $t('stop') }}
      </v-btn>
    </v-row>
    <v-alert
      v-if="err"
      color="error"
    >
      {{ err }}
    </v-alert>
    <v-row class="no-gutters">
      <v-btn
        @click="generateRing"
        :disabled="selectedRespondents.size < 2"
      >
        {{ $t('generate_ring') }}
      </v-btn>
    </v-row>
    <v-card class="my-2">
      <v-list dense>
        <v-list-item class="no-gutters">
          <v-simple-checkbox
            :value="allSelected"
            :indeterminate="someSelected"
            @click="toggleSelectAll"
          />
          <h3>
            {{ $t('decisions_n', [allDecisions.length]) }}
          </h3>
        </v-list-item>

        <v-list-item
          v-for="decision in allDecisions"
          :key="decision.surveyId"
          @click="toggleSelectedRespondent(decision.respondentId)"
        >
          <v-checkbox :value="selectedRespondents.has(decision.respondentId)" />
          {{ respondents[decision.respondentId] ? respondents[decision.respondentId].getName() : $t('loading') }}
        </v-list-item>
      </v-list>
    </v-card>
    <v-card class="my-2">
      <v-list dense>
        <v-list-item>
          <h3>
            {{ $t('connections_n', [Object.keys(connections).length]) }}
          </h3>
        </v-list-item>
        <v-list-item
          v-for="conn, key in connections"
          :key="key"
        >
          {{ conn.device.deviceName }} ({{ conn.device.deviceId }})
        </v-list-item>
      </v-list>
    </v-card>

    <TrellisModal
      v-model="showReport"
      :title="$t('report')"
    >
      <ReportTable
        v-if="report"
        :report="report"
      />
      <v-row class="no-gutters">
        <v-spacer />
        <v-btn
          @click="exec(synchronize)"
          :disabled="working || !!err"
          :loading="working"
        >
          {{ $t('save') }}
        </v-btn>
        <v-btn
          @click="showReport = false"
          :disabled="working"
        >
          {{ $t('cancel') }}
        </v-btn>
      </v-row>
    </TrellisModal>
    <TrellisModal
      v-model="showPrevReports"
      :title="$t('previous_reports')"
    >
      <PreviousReports :reports="reports" />
    </TrellisModal>
  </v-col>
</template>

<style lang="sass">

</style>
