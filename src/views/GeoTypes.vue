<template>
  <v-flex xs12>
    <v-container full-width>
      <v-toolbar flat>
        <v-toolbar-title>{{$t('geo_types')}}</v-toolbar-title>
        <v-spacer />
        <Permission :requires="TrellisPermission.ADD_GEO_TYPE">
          <v-btn
            icon
            @click="isAdding = true">
            <v-icon>add</v-icon>
          </v-btn>
        </Permission>
      </v-toolbar>
      <v-data-table
        :loading="isLoading || isBusy"
        :headers="headers"
        hide-actions
        :items="geoTypes">
        <GeoTypeRow
          :geoType="geoType"
          @edit="startEditing(geoType)"
          @remove="removeGeoType(geoType)"
          slot="items"
          slot-scope="{item: geoType}" />
      </v-data-table>
    </v-container>
    <TrellisModal
      v-model="isEditing"
      :title="$t('resource_editing', [$t('geo_type')])">
      <GeoTypeForm
        :geoType="editingGeoType"
        :isBusy="isBusy"
        @save="updateGeoType" />
    </TrellisModal>
    <TrellisModal
      v-model="isAdding"
      :title="$t('resource_creating', [$t('geo_type')])">
      <GeoTypeForm
        :isBusy="isBusy"
        @save="addGeoType"/>
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoTypeForm from '../components/geo/GeoTypeForm.vue'
  import Permission from '../components/Permission.vue'
  import TrellisModal from '../components/TrellisModal.vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import global from '../static/singleton'
  import GeoTypeRow from '../components/geo/GeoTypeRow.vue'
  import GeoType from '../entities/trellis/GeoType'
  import GeoTypeService from '../services/geotype'
  export default Vue.extend({
    name: 'GeoTypes',
    components: { GeoTypeRow, TrellisModal, GeoTypeForm, Permission },
    mixins: [DocsLinkMixin('./locations/LocationTypes.md')],
    data () {
      return {
        geoTypes: [],
        global,
        headers: [{
          text: '',
          sortable: false
        }, {
          text: this.$t('name'),
          value: 'name'
        }, {
          text: this.$t('can_user_create'),
          value: 'canUserAdd',
          align: 'center'
        }, {
          text: this.$t('can_user_add_child'),
          value: 'canUserAddChild',
          align: 'center'
        }, {
          text: this.$t('can_contain_respondent'),
          value: 'canContainRespondent',
          align: 'center'
        }],
        isWorking: false,
        isLoading: false,
        isEditing: false,
        isAdding: false,
        isBusy: false,
        editingGeoType: null as GeoType
      }
    },
    created () {
      this.loadGeoTypes()
    },
    methods: {
      async loadGeoTypes () {
        try {
          this.isLoading = true
          this.geoTypes = await GeoTypeService.allStudyGeoTypes(this.global.study.id)
        } catch (err) {
          this.log(err)
          this.alert('error', 'Unable to load', {timeout: 0})
        } finally {
          this.isLoading = false
        }
      },
      startEditing (geoType: GeoType) {
        this.editingGeoType = geoType
        this.isEditing = true
      },
      async addGeoType (geoType: GeoType) {
        try {
          this.isBusy = true
          const newGeoType: GeoType = await GeoTypeService.create(this.global.study.id, geoType)
          this.geoTypes.push(newGeoType)
          this.isAdding = false
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_create', [this.$t('geo_type')]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      },
      async updateGeoType (geoType: GeoType) {
        try {
          this.isBusy = true
          const updatedGeoType: GeoType = await GeoTypeService.update(geoType)

          const index = this.geoTypes.findIndex(gt => gt.id === geoType.id)
          if (index > -1) {
            this.geoTypes.splice(index, 1, updatedGeoType)
          }
          this.isEditing = false
          this.editingGeoType = null
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_update', [geoType.name]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      },
      async removeGeoType (geoType: GeoType) {
        if (!confirm(this.$t('confirm_resource_delete', [geoType.name]))) return
        try {
          this.isBusy = true
          await GeoTypeService.remove(geoType.id)
          const index = this.geoTypes.indexOf(geoType)
          if (index > -1) {
            this.geoTypes.splice(index, 1)
          }
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_delete', [geoType.name]), {timeout: 0})
        } finally {
          this.isBusy = false
        }
      }
    }
  })
</script>

<style scoped>

</style>
