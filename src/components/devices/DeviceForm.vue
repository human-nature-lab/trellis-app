<template>
  <v-form ref="form" v-if="!isLoading" v-model="isValid">
    <v-container>
      <v-layout column>
        <v-flex>
          <v-text-field
            v-model="memDevice.name"
            :rules="deviceNameRules"
            :label="$t('device_name')" />
        </v-flex>
        <v-flex>
          <v-text-field
            v-model="deviceId"
            :rules="deviceIdRules"
            :label="$t('device_id')" />
        </v-flex>
        <v-flex>
          <v-spacer />
          <v-btn
            @click="save"
            :disabled="!isValid">
            <TrellisLoadingCircle v-if="isBusy" size="30px" />
            <span v-else>{{$t('save')}}</span>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Device from '../../entities/trellis/Device'
  import CompareService from '../../services/CompareService'
  import ValidationMixin from '../../mixins/ValidationMixin'
  import TrellisLoadingCircle from '../TrellisLoadingCircle'
  export default Vue.extend({
    name: 'DeviceModal',
    mixins: [ValidationMixin],
    components: {TrellisLoadingCircle},
    props: {
      device: Object as () => Device,
      isBusy: Boolean
    },
    data () {
      return {
        memDevice: null,
        isLoading: false,
        deviceNameRules: [this.minLength(3)],
        deviceIdRules: [this.minLength(10)],
        isValid: false
      }
    },
    created () {
      this.updateMemcopy(this.device)
    },
    watch: {
      device (newDevice): void {
        this.updateMemcopy(newDevice)
      }
    },
    computed: {
      canSave (): boolean {
        return !this.isLoading && !this.isBusy && this.isValid && !CompareService.entitiesAreEqual(this.memDevice, this.device)
      },
      // This computed property is used to prevent spaces from being added to the device id. It only affects what is sent
      // to the server, but does not reflect these changes in the view.
      deviceId: {
        get (): string {
          return this.memDevice.deviceId
        },
        set (val: string) {
          this.memDevice.deviceId =  val.replace(/\s/g, '')
        }
      }
    },
    methods: {
      updateMemcopy (device): void {
        if (device) {
          this.memDevice = device.copy()
        } else {
          const d = new Device()
          d.name = ''
          d.deviceId = ''
          this.$set(this, 'memDevice', d)
        }
      },
      save (): void {
        if (this.canSave && this.$refs.form.validate() && !CompareService.entitiesAreEqual(this.memDevice, this.device)) {
          this.$emit('save', this.memDevice)
        } else if (this.isValid) {
          // Don't save when nothing has changed
          this.$emit('input', false)
        }
      }
    }
  })
</script>
