<template>
  <v-flex xs12>
    <v-progress-linear
      v-if="isLoading"
      indeterminate />
    <v-card v-for="formType in numericFormTypes">
      <v-toolbar flat>
        <v-toolbar-title>{{ formTypeName(formType) }}</v-toolbar-title>
        <v-spacer />
        <Permission :requires="TrellisPermission.ADD_FORM">
          <v-btn
            icon
            @click="addForm(formType)">
            <v-icon>add</v-icon>
          </v-btn>
        </Permission>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        hide-actions
        :items="studyFormsByType(formType)">
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
  import Permission from "../components/Permission"
  import StudyForm from "../entities/trellis/StudyForm"
  import FormService from '../services/form/FormService'
  import TranslationService from "../services/TranslationService"
  import formTypes from "../static/form.types"
  import global, {Singleton} from '../static/singleton'
  import Form from "../entities/trellis/Form"
  import FormListTile from "../components/forms/FormListTile"
  import TrellisModal from '../components/TrellisModal'
  import FormSkips from '../components/forms/FormSkips'

  export default Vue.extend({
    name: 'Forms',
    components: {FormListTile, TrellisModal, FormSkips, Permission},
    async created () {
      this.isLoading = true
      this.studyForms = await FormService.getAllStudyForms(global.study.id)
      this.isLoading = false
    },
    data () {
      return {
        formTypes,
        global: global as Singleton,
        studyForms: null,
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
    computed: {
      numericFormTypes: function() {
        return Object.keys(formTypes).filter(formType => {
          return !isNaN(Number(formType))
        })
      }
    },
    methods: {
      studyFormsByType(formType) {
        return (this.studyForms || []).filter(studyForm => {
          return studyForm.formTypeId == formType
        })
      },
      formName (form: Form) {
        return TranslationService.getAny(form.nameTranslation, this.global.locale)
      },
      async addForm (type: formTypes) {
        try {
          const form = await FormService.createForm(this.global.study.id, type)
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
      formTypeName (formType: formTypes) {
        formType = +formType  // convert to int
        switch (formType) {
          case formTypes.CENSUS:
            return this.$t('census_forms')
          case formTypes.DEFAULT_CENSUS:
            return this.$t('default_census_forms')
          default:
            return this.$t('forms')
        }
      },
      async deleteForm (studyForm: StudyForm) {
        if (confirm(this.$t('confirm_resource_delete', [this.formName(studyForm.form)]))) {
          try {
            await FormService.deleteForm(this.global.study.id, studyForm.id)
            const index = this.studyForms.findIndex(sf => sf.id === studyForm.id)
            this.studyForms.splice(index, 1)
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
