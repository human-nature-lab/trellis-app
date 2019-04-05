<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('devices')}}</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click="showAddDevice">
        <v-icon>add</v-icon>
      </v-btn>
    </v-toolbar>
    <v-data-table
      :loading="isBusy"
      :items="devices"
      :rows-per-page-items="[25, 50, 100, {text: 'All', value: -1}]"
      :pagination.sync="pagination"
      :headers="headers">
      <template slot="items" slot-scope="{item: device}">
        <td>
          <v-menu
            offset-x
            max-width="60px"
            lazy>
            <v-btn icon slot="activator">
              <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile @click="startEdit(device)">
                <v-icon>edit</v-icon>
              </v-list-tile>
              <v-list-tile @click="deleteDevice(device)">
                <v-icon color="error">delete</v-icon>
              </v-list-tile>
            </v-list>
          </v-menu>
        </td>
        <td>{{device.name}}</td>
        <td>{{device.deviceId}}</td>
      </template>
    </v-data-table>
    <TrellisModal v-model="isAdding" :title="$t('new_device')">
      <DeviceForm @save="createDevice" :isBusy="isBusy"/>
    </TrellisModal>
    <TrellisModal v-model="isEditing" :title="$t('editing_device')">
      <DeviceForm @save="updateDevice" :isBusy="isBusy" :device="editingDevice" />
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DeviceService from "../services/device/DeviceService"
  import TrellisModal from '../components/TrellisModal'
  import DeviceForm from '../components/devices/DeviceForm'
  import Pagination from "../types/Pagination"
  export default Vue.extend({
    name: 'Devices',
    components: { TrellisModal, DeviceForm },
    data () {
      return {
        isBusy: false,
        isAdding: false,
        isEditing: false,
        editingDevice: null,
        headers: [{
          text: this.$t('actions'),
          sortable: false
        }, {
          text: this.$t('device_name'),
          value: 'name'
        }, {
          text: this.$t('android_device_id'),
          value: 'deviceId'
        }],
        pagination: {
          rowsPerPage: 25
        } as Pagination<Device>,
        devices: []
      }
    },
    created () {
      this.loadDevices()
    },
    methods: {
      showAddDevice () {
        this.isAdding = true
      },
      async createDevice (device: Device) {
        this.isBusy = true
        try {
          const d = await DeviceService.createDevice(device)
          this.devices.push(d)
          this.isAdding = false
          this.alert('success', this.$t('resource_created', [d.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_create', [d.name]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      },
      async loadDevices () {
        this.isBusy = true
        try {
          const page = await DeviceService.getDevices(this.pagination)
          this.pagination.total = page.total
          this.pagination.start = page.start
          this.pagination.count = page.count
          this.devices = page.data
        } catch (err) {
          this.alert('error', err.message, {timeout: 0})
        } finally {
          this.isBusy = false
        }
      },
      startEdit (device: Device) {
        this.editingDevice = device
        this.isEditing = true
      },
      async deleteDevice (device: Device) {
        if (!confirm(this.$t('confirm_resource_delete', [device.name]))) return
        this.isBusy = true
        try {
          await DeviceService.deleteDevice(device.id)
          const index = this.devices.findIndex(d => d.id === device.id)
          if (index > -1) {
            this.devices.splice(index, 1)
          }
          this.alert('success', this.$t('resource_deleted', [device.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_delete', [device.name]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      },
      async updateDevice (device: Device) {
        this.isBusy = true
        try {
          const d = await DeviceService.updateDevice(device)
          const index = this.devices.findIndex(d => d.id === device.id)
          if (index > -1) {
            this.devices.splice(index, 1, d)
          }
          this.isEditing = false
          this.editingDevice = null
          this.alert('success', this.$t('resource_updated', [device.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_update', [device.name]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      }
    }
  })
</script>
