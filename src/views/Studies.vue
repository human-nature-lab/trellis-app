<template>
  <v-flex>
    <v-container class="ma-0 pa-0">
      <v-toolbar flat>
        <v-toolbar-title>
          {{$t('studies')}}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          @click="isAdding=true"
          icon>
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :loading="isLoading"
        :headers="headers"
        hide-actions
        :items="studies">
        <StudyRow
          slot="items"
          slot-scope="{item: study} = props"
          @edit="startEditing(study)"
          @remove="removeStudy(study)"
          :key="study.id"
          :study="study"
          :locales="locales" />
      </v-data-table>
    </v-container>
    <TrellisModal v-model="isEditing" title="Editing Study">
      <StudyForm
        :study="editingStudy"
        :isWorking="isWorking"
        :locales="locales"
        @save="updateStudy" />
    </TrellisModal>
    <TrellisModal v-model="isAdding" title="Adding Study">
      <StudyForm
        :isWorking="isWorking"
        :locales="locales"
        @save="createStudy" />
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyForm from '../components/studies/StudyForm'
  import StudyRow from '../components/studies/StudyRow'
  import TrellisModal from '../components/TrellisModal'
  import Study from '../entities/trellis/Study'
  import LocaleService from '../services/locale/LocaleService'
  import StudyService from '../services/study/StudyService'
  export default Vue.extend({
    name: 'Studies',
    components: {StudyRow, TrellisModal, StudyForm},
    data () {
      return {
        isLoading: false,
        isAdding: false,
        isEditing: false,
        isWorking: false,
        editingStudy: null,
        headers: [{
          text: this.$t('actions'),
          sortable: false
        }, {
          text: this.$t('name'),
          value: 'name'
        }, {
          text: this.$t('photo_quality'),
          value: 'photoQuality'
        }, {
          text: this.$t('languages'),
          sortable: false
        }, {
          text: this.$t('default_language'),
          value: 'defaultLocale.languageName'
        }],
        studies: [],
        locales: []
      }
    },
    created () {
      this.loadStudies()
      this.loadLocales()
    },
    methods: {
      startEditing (study: Study) {
        this.editingStudy = study
        this.isEditing = true
      },
      async updateStudy (study: Study) {
        try {
          this.isWorking = true
          console.log('study', study)
          const updatedStudy = await StudyService.updateStudy(study)
          const oldStudy = this.studies.find(s => s.id === updatedStudy.id)
          if (oldStudy) {
            Object.assign(oldStudy, updatedStudy)
          }
          this.alert('success', this.$t('resource_updated', [updatedStudy.name]))
          this.isEditing = false
          this.editingStudy = null
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_update', [study.name]), {timeout: 0})
        } finally {
          this.isWorking = false
        }
      },
      async createStudy (study: Study) {
        try {
          this.isWorking = true
          const newStudy = await StudyService.createStudy(study)
          this.studies.push(newStudy)
          this.alert('success', this.$t('resource_created', [study.name]))
          this.isAdding = false
        } catch (err){
          this.log(err)
          this.alert('error', this.$t('failed_resource_create', [study.name]), {timeout: 0})
        } finally {
          this.isWorking = false
        }
      },
      async removeStudy (study: Study) {
        if (!confirm(this.$t('confirm_resource_delete', [study.name]))) return
        try {
          this.isWorking = true
          await StudyService.removeStudy(study.id)
          const index = this.studies.findIndex(s => s.id === study.id)
          this.studies.splice(index, 1)
          this.alert('success', this.$t('resource_deleted', [study.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_delete', [study.name]), {timeout: 0})
        } finally {
          this.isWorking = false
        }
      },
      async loadStudies (): void {
        try {
          this.isLoading = true
          this.studies = await StudyService.getAllStudies()
        } catch (err) {
          this.log(err)
          this.alert('error', err.message, {timeout: 0})
        } finally {
          this.isLoading = false
        }
      },
      async loadLocales (): void {
        try {
          this.locales = await LocaleService.getAllLocales()
        } catch (err) {
          this.log(err)
          this.alert('error', err.message, {timeout: 0})
        }
      }
    }
  })
</script>

<style scoped>

</style>
