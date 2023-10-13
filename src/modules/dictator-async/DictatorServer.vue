<script setup lang="ts">
import NearbyCommunications, { Connection } from '@/services/nearby-communications'
import { ref, onBeforeUnmount, set, del, onBeforeMount, computed } from 'vue'
import { Message, CandidatesRequest, CandidatesResponse, Device, Decision, Actor, Pair, DBActor } from './common'
import { Server, ServerSocket } from '@/services/nearby-communications/server'
import { onBeforeUnload } from '@/helpers/window.helper'
import { reactiveSet } from '@/lib/reactive-set'
import { shuffle } from 'lodash'

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

const connections = ref<Record<string, Conn>>({})

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

type SocketDecision = Decision & ({ socketId: string } | { isLocal: boolean })
const allDecisions = computed(() => {
  const decisions = [] as SocketDecision[]
  for (const decision of localConn.value.decisions) {
    decisions.push({
      ...decision,
      isLocal: true,
    })
  }
  for (const socketId in connections.value) {
    const conn = connections.value[socketId]
    for (const decision of conn.decisions) {
      decisions.push({
        ...decision,
        socketId,
      })
    }
  }
  return decisions
})

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

async function generateRing () {
  const respondentDecisions = new Map<string, SocketDecision>()
  for (const decision of allDecisions.value) {
    respondentDecisions.set(decision.respondentId, decision)
  }
  const respIds = shuffle(Array.from(respondentDecisions.keys()))
  const pairs = respIds.map((respId, i) => {
    const nextRespId = respIds[(i + 1) % respIds.length]
    const deciderDesc = respondentDecisions.get(respId)
    const receiverDesc = respondentDecisions.get(nextRespId)
    return {
      deciderSocketId: deciderDesc.socketId,
      deciderId: respId,
      deciderResult: deciderDesc.value + receiverDesc.value,
      receiverSocketId: receiverDesc.socketId,
      receiverId: nextRespId,
      receiverSurveyId: deciderDesc.surveyId,
    }
  })
  console.log('pairs', pairs)
}

</script>

<template>
  <v-col>
    <v-row class="no-gutters">
      <h1>Server</h1>
      <v-btn @click="$emit('stop')">
        Disconnect
      </v-btn>
      <v-spacer />
      <span>{{ server.state }}</span>
    </v-row>
    <v-col>
      ({{ props.serviceId }}) ({{ props.deviceId }})
    </v-col>
    <v-row class="no-gutters">
      <v-btn @click="generateRing">
        Generate ring
      </v-btn>
    </v-row>
    <v-list>
      <h3>Decisions ({{ allDecisions.length }})</h3>
      <v-list-item
        v-for="decision in allDecisions"
        :key="decision.surveyId"
        @click="toggleSelectedRespondent(decision.respondentId)"
      >
        <v-checkbox :value="selectedRespondents.has(decision.respondentId)" />
        {{ decision.respondentId }} is giving L{{ decision.value }}
      </v-list-item>
    </v-list>
    <v-list>
      <h4>Connections ({{ Object.keys(connections).length }})</h4>
      <v-list-item
        v-for="conn, key in connections"
        :key="key"
      >
        {{ conn.device.deviceName }} ({{ conn.device.deviceId }})
      </v-list-item>
    </v-list>
  </v-col>
</template>

<style lang="sass">

</style>
