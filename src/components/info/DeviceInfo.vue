<template>
  <InfoBlock
    :title="$t('device')"
    :items="items"
    :to="{name: 'Changelog'}"/>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DeviceService from '../../services/device'
  import DatabaseService from '../../services/database'
  import InfoBlock from './InfoBlock.vue'
  import config from '../../config'

  declare const VERSION: string

  export default Vue.extend({
    name: 'DeviceInfo',
    components: { InfoBlock },
    data () {
      return {
        device: {
          key: this.$t('device_id'),
          val: null
        },
        name: {
          key: this.$t('device_name'),
          val: null
        },
        server: {
          key: this.$t('server_url'),
          val: null
        },
        version: {
          key: this.$t('version'),
          val: VERSION
        }
      }
    },
    created () {
      if (this.isCordova) {
        DeviceService.getUUID().then(id => {
          this.device.val = id
        })
        DatabaseService.getServerIPAddress().then(url => {
          this.server.val = url
        })
        DeviceService.getDeviceName().then(name => {
          this.name.val = name
        })
      } else {
        this.device.val = navigator.userAgent
        this.server.val = config.apiRoot
      }
    },
    computed: {
      items (): object[] {
        return [this.version, this.device, this.name, this.server]
      }
    }
  })
</script>
