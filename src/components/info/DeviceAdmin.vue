<template>
  <v-card>
    <v-card-title @click="onClickAdmin">
      {{ $t('admin') }}
    </v-card-title>
    <v-card-text>
      <v-row
        no-gutters
        class="justify-space-between"
      >
        <v-btn
          color="error"
          :disabled="isWorking"
          @click="unregister"
        >
          <TrellisLoadingCircle
            v-if="isWorking"
            size="25px"
          />
          <span v-else>{{ $t('unregister_device') }}</span>
        </v-btn>
        <v-btn
          color="error"
          :disabled="isWorking"
          @click="deleteUploads"
        >
          <TrellisLoadingCircle
            v-if="isWorking"
            size="25px"
          />
          <span v-else>
            {{ $t('delete_uploads') }}
          </span>
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import DeviceService from '../../services/device'
import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
import UploadService from '../../services/upload/UploadServiceCordova'

export default Vue.extend({
  name: 'DeviceAdmin',
  components: { TrellisLoadingCircle },
  data () {
    return {
      isWorking: false,
      adminClicks: 0,
    }
  },
  methods: {
    onClickAdmin () {
      this.adminClicks++
      if (this.adminClicks >= 5) {
        this.$router.push('/test')
      }
    },
    async unregister () {
      if (!confirm(this.$t('confirm_unregister_device') as string)) return
      try {
        this.isWorking = true
        await DeviceService.removeDeviceKey()
      } finally {
        this.isWorking = false
      }
    },
    async deleteUploads () {
      if (!confirm(this.$t('confirm_delete_uploads') as string)) return
      try {
        this.isWorking = true
        await UploadService.removeUploads()
      } catch (err) {
        this.logError(err)
      } finally {
        this.isWorking = false
      }
    },
  },
})
</script>
