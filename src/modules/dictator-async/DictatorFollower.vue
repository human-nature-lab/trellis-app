<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import StatusChip from './StatusChip.vue'
import { CandidatesRequest, CandidatesResponse, DBActor, Device, Message, PairRequest } from './common'
import { Client } from '@/services/nearby-communications/client'
import { onBeforeUnload } from '@/helpers/window.helper'

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
  client.value.handle(Message.CompleteTx, async () => {
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
      <h1>{{ $t('follower') }}</h1>
      <StatusChip :status="client.state" />
      <v-spacer />
      <v-btn @click="$emit('stop')">
        {{ $t('disconnect') }}
      </v-btn>
    </v-row>
  </v-col>
</template>

<style lang="sass">

</style>
