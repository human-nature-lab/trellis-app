<template>
  <v-flex xs12>
    <v-progress-linear
      v-if="isLoading"
      indeterminate></v-progress-linear>
    <v-card v-for="formType in numericFormTypes" :key="formType">
      <v-toolbar flat>
        <v-toolbar-title>{{ formTypeName(formType) }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <permission :requires="TrellisPermission.ADD_FORM">
          <v-menu
            offset-x
            lazy>
            <v-btn icon slot="activator">
              <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile @click="addForm(formType)">
                <v-list-tile-action>
                  <v-icon>add</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  Add Form
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile @click="showFormImport = true">
                <v-list-tile-action>
                  <v-icon>import_export</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  Import Form
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-menu>
<!--          <v-btn-->
<!--            icon-->
<!--            @click="addForm(formType)">-->
<!--            <-->
<!--          </v-btn>-->
        </permission>
      </v-toolbar>
      <v-data-table
        :headers="headers(formType)"
        hide-actions
        :items="studyFormsByType(formType)">
        <template slot="items" slot-scope="props">
          <form-list-tile
            :form="props.item.form"
            :study-form="props.item"
            :form-type="formType"
            v-model="props.item.showHidden"
            @save="updateForm"
            @updateStudyForm="updateStudyForm"
            @delete="deleteForm(props.item)"></form-list-tile>
           <tr v-if="props.item.showHidden">
            <td colspan="4">
              <form-skips :form="props.item.form"></form-skips>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Permission from '../components/Permission.vue'
  import StudyForm from '../entities/trellis/StudyForm'
  import FormService from '../services/form/FormService'
  import TranslationService from '../services/TranslationService'
  import formTypes from '../static/form.types'
  import global, { Singleton } from '../static/singleton'
  import Form from '../entities/trellis/Form'
  import FormListTile from '../components/forms/FormListTile.vue'
  import TrellisModal from '../components/TrellisModal.vue'
  import FormSkips from '../components/forms/FormSkips.vue'
  import DocsFiles from '../components/documentation/DocsFiles'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'

  export default Vue.extend({
    name: 'Forms',
    mixins: [DocsLinkMixin(DocsFiles.getting_started.create_form)],
    components: {FormListTile, TrellisModal, FormSkips, Permission},
    created () {
      this.loadForms()
    },
    data () {
      return {
        formTypes,
        global: global as Singleton,
        studyForms: null,
        isAddingNewForm: false,
        isLoading: false,
        showImportForm: false
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
      headers(formType) {
        let hdr = [{
          text: 'Actions'
        }, {
          text: 'Form',
          class: 'max-width'
        }]

        if (formType == formTypes.CENSUS) {
          hdr.push({
            text: 'Census type'
          })
        }

        hdr = hdr.concat([{
          text: 'Published'
        }, {
          text: ''
        }])

        return hdr.map((h, i) => {
          h.sortable = false
          h.value = i
          h.class = h.class || 'small'
          return h
        });
      },
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
          const studyForm = await FormService.createForm(this.global.study.id, type)
          this.studyForms.push(studyForm)
          this.alert('success', this.$t('resource_created', [this.formName(studyForm.form)]))
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_create', [this.$t('form')]))
          }
        }
      },
      async updateForm (form: Form) {
        try {
          const newForm = await FormService.updateForm(form)
          const sf = this.studyForms.find((sf: StudyForm) => sf.form.id === form.id)
          Object.assign(sf.form, newForm)
          this.alert('success', this.$t('resource_updated', [this.formName(form)]))
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_update', [this.formName(form)]))
          }
        }
      },
      async updateStudyForm (studyForm: StudyForm) {
        try {
          const newStudyForm = await FormService.updateStudyForm(studyForm.studyId, studyForm)
          const sf = this.studyForms.find((sf: StudyForm) => sf.id === newStudyForm.id)
          Object.assign(sf.form, newStudyForm)
          this.alert('success', this.$t('resource_updated', [this.formName(studyForm.form)]))
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_update', [this.formName(studyForm.form)]))
          }
        }
      },
      async loadForms () {
        this.isLoading = true
        try {
          this.studyForms = await FormService.getAllStudyForms(global.study.id)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to load forms')
          }
        } finally {
          this.isLoading = false
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
            await FormService.deleteForm(this.global.study.id, studyForm.form.id)
            const index = this.studyForms.findIndex(sf => sf.id === studyForm.id)
            this.studyForms.splice(index, 1)
            this.alert('success', this.$t('resource_deleted', [this.formName(studyForm.form)]))
          } catch (err) {
            if (this.isNotAuthError(err)) {
              this.logError(err, this.$t('failed_resource_delete', [this.formName(studyForm.form)]))
            }
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
