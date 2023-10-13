<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { Actor, CandidatesRequest, CandidatesResponse, CompleteTxRequest, DBActor, Device, Message, PairRequest } from './common'
import { Client } from '@/services/nearby-communications/client'
import DatabaseService from '@/services/database'
import DatabaseServiceCordova from '@/services/database/DatabaseServiceCordova'
import Question from '@/entities/trellis/Question'
import PT from '@/static/parameter.types'
import { onBeforeUnload } from '@/helpers/window.helper'

const dbSvc = DatabaseService as DatabaseServiceCordova
const props = defineProps<{
  serviceId: string
  deviceId: string
  deviceName: string
}>()

const client = ref<Client>()

async function onConnection () {
  return client.value.send<Device>('hello', {
    deviceId: props.deviceId,
    deviceName: props.deviceName,
  })
}

onBeforeMount(async () => {
  client.value = new Client(props.serviceId, 'star')
  client.value.onConnection.add(onConnection)
  const actor = new DBActor()
  client.value.handle(Message.Candidates, async (req: CandidatesRequest) => {
    console.log('candidates', req)
    const decisions = await actor.getDecisions(req.formId)
    return decisions as CandidatesResponse
  })
  client.value.handle(Message.StartPairs, async (req: PairRequest) => {
    return actor.startSave(req.pairs)
  })
  client.value.handle(Message.CompleteTx, async (req: CompleteTxRequest) => {
    return actor.completeSave()
  })
  client.value.handle(Message.RollbackTx, async () => {
    return actor.rollbackSave()
  })
  await client.value.connect()
})

async function disconnect () {
  if (client.value) {
    await client.value.disconnect()
  }
}

onBeforeUnmount(disconnect)
onBeforeUnload(disconnect)

</script>

<template>
  <v-col class="pa-0 ma-0">
    <v-row class="no-gutters">
      <h1>Client</h1>
      <v-btn @click="$emit('stop')">
        Disconnect
      </v-btn>
      <v-spacer />
      <span>{{ client.state }}</span>
    </v-row>
    <!-- <v-alert
      v-if="error"
      color="error"
    >
      {{ error }}
    </v-alert> -->
    <v-col>
      ({{ props.serviceId }}) ({{ props.deviceId }})
    </v-col>
  </v-col>
</template>

<style lang="sass">

</style>
