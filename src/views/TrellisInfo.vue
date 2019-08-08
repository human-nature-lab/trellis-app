<template>
    <v-container class="ma-1" grid-list-sm fluid>
      <v-layout row wrap>
        <v-flex xs12 sm12 md6 lg6 xl6>
          <DeviceInfo />
        </v-flex>
        <Permission mobile-only>
          <v-flex xs12 sm12 md6 lg6 xl6>
            <UploadsInfo />
          </v-flex>
        </Permission>
        <Permission mobile-only>
          <v-flex xs12 sm12 md6 lg6 xl6>
            <StorageInfo />
          </v-flex>
        </Permission>
        <Permission mobile-only>
          <v-flex xs12 sm12 md6 lg6 xl6>
            <GPSInfo />
          </v-flex>
        </Permission>
        <Permission mobile-only>
          <v-flex xs12 sm12 md6 lg6 xl6>
            <LogsInfo />
          </v-flex>
        </Permission>
        <Permission mobile-only>
          <v-flex xs12 sm12 md6 lg6 xl6>
            <DeviceAdmin />
          </v-flex>
        </Permission>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
  import Vue, { Component } from 'vue'
  import { RawLocation } from 'vue-router/types/router'
  import DeviceAdmin from '../components/info/DeviceAdmin.vue'
  import DeviceInfo from '../components/info/DeviceInfo.vue'
  import GPSInfo from '../components/info/GPSInfo.vue'
  import StorageInfo from '../components/info/StorageInfo.vue'
  import UploadsInfo from '../components/info/UploadsInfo.vue'
  import LogsInfo from '../components/info/LogsInfo.vue'
  import Permission from '../components/Permission.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'

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
    components: { LogsInfo, GPSInfo, DeviceInfo, StorageInfo, UploadsInfo, DeviceAdmin, Permission },
    mixins: [DocsLinkMixin('./admin/Information.md')]
  })
</script>

<style lang="sass" scoped>
  /*.card*/
    /*width:*/
</style>
