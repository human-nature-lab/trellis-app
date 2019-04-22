<template>
  <v-card>
    <v-card-text>
      <v-container>
        <v-layout class="display-1 mb-2">{{$t('admin')}}</v-layout>
        <v-layout>
          <v-btn
            color="error"
            :disabled="isWorking"
            @click="unregister">
            <TrellisLoadingCircle v-if="isWorking" size="25px"/>
            <span v-else>{{$t('unregister_device')}}</span>
          </v-btn>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DeviceService from '../../services/device/DeviceService'

  export default Vue.extend({
    name: "DeviceAdmin",
    data () {
      return {
        isWorking: false
      }
    },
    methods: {
      async unregister () {
        if (!confirm(this.$t('confirm_unregister_device'))) return
        try {
          this.isWorking = true
          await DeviceService.removeDeviceKey()
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass" scoped>

</style>
