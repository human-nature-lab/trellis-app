<template>
  <v-flex xs12>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('devices')}}</v-toolbar-title>
      <v-spacer />
      <Permission :requires="TrellisPermission.ADD_DEVICE">
        <v-btn
          icon
          @click="showAddDevice">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </Permission>
    </v-toolbar>
    <v-data-table
      :loading="isBusy"
      :footer-props="footerProps"
      :options="pagination"
      :items="devices"
      :headers="headers">
      <template v-slot:item="{ item: device }">
        <tr>
          <td>
            <CRUDMenu
              :editable="hasPermission(TrellisPermission.EDIT_DEVICE)"
              :removable="hasPermission(TrellisPermission.REMOVE_DEVICE)"
              @edit="startEdit(device)"
              @remove="deleteDevice(device)" />
          </td>
          <td>{{device.name}}</td>
          <td>{{device.deviceId}}</td>
          <td>{{device.addedByUser && device.addedByUser.name}}</td>
        </tr>
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
  import Permission from '../components/Permission.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import PermissionMixin from '../mixins/PermissionMixin'
  import DeviceService from '../services/device'
  import TrellisModal from '../components/TrellisModal.vue'
  import DeviceForm from '../components/devices/DeviceForm.vue'
  import Pagination from '../types/Pagination'
  import CRUDMenu from '../components/CRUDMenu.vue'
  import Device from '../entities/trellis/Device'
  export default Vue.extend({
    name: 'Devices',
    mixins: [PermissionMixin, DocsLinkMixin('./devices/Devices.md')],
    components: { TrellisModal, DeviceForm, CRUDMenu, Permission },
    data () {
      return {
        isBusy: false,
        isAdding: false,
        isEditing: false,
        editingDevice: null,
        serverItemsLength: null,
        footerProps: {
          itemsPerPageAllText: this.$t('all'),
          itemsPerPageOptions: [20, 50, 100, -1],
          itemsPerPageText: this.$t('rows_per_page'),
        },
        pagination: {
          itemsPerPage: 20,
          page: 0
        },
        headers: [{
          text: this.$t('actions'),
          sortable: false
        }, {
          text: this.$t('device_name'),
          value: 'name'
        }, {
          text: this.$t('mobile_device_id'),
          value: 'deviceId'
        }, {
          text: this.$t('added_by_user'),
          value: 'addedByUser.name'
        }],
        devices: []
      }
    },
    created () {
      this.loadDevices()
    },
    methods: {
      showAddDevice () {
        this.alert('info', 'Use the Trellis app on the device you want to add')
      },
      async createDevice (device: Device) {
        this.isBusy = true
        try {
          const d = await DeviceService.createDevice(device)
          this.devices.push(d)
          this.isAdding = false
          this.alert('success', this.$t('resource_created', [d.name]))
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_create', [device.name]))
          }
        } finally {
          this.isBusy = false
        }
      },
      async loadDevices () {
        this.isBusy = true
        try {
          const page = await DeviceService.getDevices(this.footerProps.pagination)
          this.serverItemsLength = page.total
          this.devices = page.data
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
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
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_delete', [device.name]))
          }
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
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_update', [device.name]))
          }
        } finally {
          this.isBusy = false
        }
      }
    }
  })
</script>
