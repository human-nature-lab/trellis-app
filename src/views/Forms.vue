<template>
  <v-flex>
    <v-card v-for="(studyForms, formType) in formBins">
      <v-toolbar flat>
        <v-toolbar-title>{{ formTypeName(formType) }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="addForm(formType)">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear
        v-if="isLoading"
        indeterminate />
      <v-data-table
        :headers="headers"
        :items="studyForms">
        <template slot="items" slot-scope="props">
          <FormListTile
            :form="props.item.form"
            v-model="props.item.showHidden"
            @save="updateForm"
            @delete="deleteForm(studyForm)" />
           <tr v-if="props.item.showHidden">
            <td colspan="4">
              <FormSkips :form="props.item.form" />
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyForm from "../entities/trellis/StudyForm"
  import FormService from '../services/form/FormService'
  import TranslationService from "../services/TranslationService"
  import formTypes from "../static/form.types"
  import global from '../static/singleton'
  import Form from "../entities/trellis/Form"
  import FormListTile from "../components/forms/FormListTile"
  import TrellisModal from '../components/TrellisModal'
  import FormSkips from '../components/forms/FormSkips'
  export default Vue.extend({
    name: 'Forms',
    components: {FormListTile, TrellisModal, FormSkips},
    async created () {
      this.studyForms = await FormService.getAllStudyForms(global.study.id)
      this.makeBins()
    },
    data () {
      return {
        global: global as Singleton,
        studyForms: null,
        formBins: {} as {[key: string]: Form[]},
        isAddingNewForm: false,
        isLoading: false,
        headers: [{
          text: 'Actions'
        }, {
          text: 'Form',
          class: 'max-width'
        }, {
          text: 'Published'
        }, {
          text: ''
        }].map((h, i) => {
          h.sortable = false
          h.value = i
          h.class = h.class || 'small'
          return h
        })
      }
    },
    methods: {
      formName (form: Form) {
        return TranslationService.getAny(form.nameTranslation, this.global.locale)
      },
      async addForm (type: formTypes) {
        try {
          const form = await FormService.createForm(this.global.study.id, type)
          this.formBins[type].push(form)
          this.alert('success', this.$t('resource_created', [this.formName(form)]))
        } catch (err) {
          this.alert('error', this.$t('failed_resource_create', [this.$t('form')]))
        }
      },
      async updateForm (form: Form) {
        try {
          const newForm = await FormService.updateForm(form)
          const sf = this.studyForms.find((sf: StudyForm) => sf.form.id === form.id)
          Object.assign(sf.form, newForm)
          this.alert('success', this.$t('resource_updated', [this.formName(form)]))
        } catch (err) {
          this.alert('error', this.$t('failed_resource_update', [this.formName(form)]))
          this.log(err)
        }
      },
      makeBins () {
        this.isLoading = true
        const formBins = {}
        for (const studyForm of this.studyForms) {
          if (!formBins[studyForm.formTypeId]) {
            formBins[studyForm.formTypeId] = []
          }
          formBins[studyForm.formTypeId].push(studyForm)
        }
        for (const key in formBins) {
          formBins[key].sort((a, b) => a.sortOrder - b.sortOrder )
        }
        this.formBins = formBins
        this.isLoading = false
      },
      formTypeName (formType: formTypes) {
        formType = +formType  // convert to int
        switch (formType) {
          case formTypes.CENSUS:
            return this.$t('census_forms')
          case formTypes.DEFAULT_CENSUS:
            return this.$t('default_census_forms')
          default:
            return this.$t('data_forms')
        }
      },
      async deleteForm (studyForm: StudyForm) {
        debugger
        if (confirm(this.$t('confirm_delete_resource', [this.formName(studyForm.form)]))) {
          try {
            await FormService.deleteForm(this.global.study.id, studyForm.id)
            const index = this.studyForms.findIndex(sf => sf.id === studyForm.id)
            this.studyForms.splice(index, 1)
            this.makeBins()
            this.alert('success', this.$t('resource_deleted', [this.formName(studyForm.form)]))
          } catch (err) {
            this.alert('error', this.$t('failed_resource_delete', [this.formName(studyForm.form)]))
          }
        }
      }
    }
  })
</script>

<style lang="sass" scoped>
  .small
    column-width: 20px
  /*.max-width*/
    /*column-width: 90%*/
</style>
