<template>
    <v-container class="ma-1" grid-list-sm fluid>
      <v-layout row wrap>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <DeviceInfo />
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <UploadsInfo />
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <StorageInfo />
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <GPSInfo />
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <LogsInfo />
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <DeviceAdmin />
        </v-flex>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
  import DeviceAdmin from '../components/info/DeviceAdmin.vue'
  import DeviceInfo from '../components/info/DeviceInfo.vue'
  import GPSInfo from '../components/info/GPSInfo.vue'
  import StorageInfo from '../components/info/StorageInfo.vue'
  import UploadsInfo from '../components/info/UploadsInfo.vue'
  import Vue, {Component} from 'vue'
  import {RawLocation} from "vue-router/types/router"
  import LogsInfo from '../components/info/LogsInfo.vue'

  declare const VERSION: string

  interface KeyPair {
    key: string
    val?: any,
    component?: Component
  }

  interface Category {
    title: string
    items: KeyPair[]
    to?: RawLocation
    component?: Component
  }

  export default Vue.extend({
    name: 'TrellisInfo',
    components: { LogsInfo, GPSInfo, DeviceInfo, StorageInfo, UploadsInfo, DeviceAdmin }
  })
</script>

<style lang="sass" scoped>
  /*.card*/
    /*width:*/
</style>
