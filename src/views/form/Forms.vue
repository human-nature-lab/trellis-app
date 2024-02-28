<template>
  <v-container>
    <v-col>
      <v-progress-linear
        v-show="isLoading"
        indeterminate />
      <v-card class="mt-4" v-for="formType in numericFormTypes" :key="formType">
        <v-toolbar flat>
          <v-toolbar-title>{{ formTypeName(formType) }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <Permission :requires="TrellisPermission.ADD_FORM" v-if="isTestStudy">
            <v-menu  offset-y left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-on="on"
                  v-bind="attrs"
                  icon>
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="addForm(formType)">
                  <v-list-item-action>
                    <v-icon>mdi-plus</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    {{ $t('add_form') }}
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="showImportForm = true; importFormType = Number(formType)">
                  <v-list-item-action>
                    <v-icon>mdi-swap-vertical</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    {{ $t('import_form') }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </Permission>
        </v-toolbar>
        <v-data-table
          :sort-by.sync="sortBy"
          :headers="headers(formType)"
          hide-default-footer
          :items-per-page="-1"
          :items="studyFormsByType[formType]">
          <template #body="{ items }">
            <draggable
              handle=".drag-handle"
              @start="isDragging = true"
              :list="items"
              @end="reorderForms"
              tag="tbody">
              <FormListTile
                v-for="item in items"
                :key="item.id"
                :form="item.form"
                :study-form="item"
                :form-type="formType"
                :dragging="isDragging"
                v-model="item.showHidden"
                @toggleFormSkips="toggleFormSkips"
                @save="updateForm"
                @update="loadForms"
                @update:studyForm="updateStudyForm"
                @changeStudyForm="changeStudyForm"
                @delete="deleteForm(item)"
              />
            </draggable>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <TrellisModal v-model="showImportForm" :title="$t('import_form')">
      <FormImport 
        :form-type="importFormType"
        @formImported="onFormImported(importedForm)" />
    </TrellisModal>
    <TrellisModal v-model="showFormSkips" :title="$t('skips')">
      <FormSkips
        @close="showFormSkips = false"
        v-model="formSkipsForm" />
    </TrellisModal>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { groupBy } from 'lodash'
  import draggable from 'vuedraggable'
  import Permission from '@/components/Permission.vue'
  import StudyForm from '@/entities/trellis/StudyForm'
  import FormService from '@/services/form'
  import TranslationService from '@/services/TranslationService'
  import formTypes from '@/static/form.types'
  import global, { Singleton } from '@/static/singleton'
  import Form from '@/entities/trellis/Form'
  import FormListTile from '@/components/forms/FormListTile.vue'
  import TrellisModal from '@/components/TrellisModal.vue'
  import FormSkips from '@/components/forms/FormSkips.vue'
  import DocsFiles from '@/components/documentation/DocsFiles'
  import DocsLinkMixin from '@/mixins/DocsLinkMixin'
  import FormImport from '@/components/import/FormImport.vue'
  import { delay } from '@/classes/delay'
  import PermissionMixin from '@/mixins/PermissionMixin'

  export default Vue.extend({
    name: 'Forms',
    mixins: [DocsLinkMixin(DocsFiles.getting_started.create_form), PermissionMixin],
    components: {FormListTile, TrellisModal, FormSkips, Permission, FormImport, draggable},
    created() {
      this.loadForms()
    },
    data() {
      return {
        formTypes,
        global: global as Singleton,
        studyForms: null,
        isAddingNewForm: false,
        isLoading: false,
        isDragging: false,
        importFormType: formTypes.CENSUS,
        sortBy: 'sortOrder',
        formSkipsForm: null,
        showFormSkips: false,
        showImportForm: false,
      }
    },
    computed: {
      studyFormsByType() {
        return groupBy(this.studyForms, 'formTypeId')
      },
      numericFormTypes: function () {
        let formTypeKeys = Object.keys(formTypes).filter(formType => {
          return (!isNaN(Number(formType)));
        })
        return formTypeKeys.filter(formType => {
          // Filter out DEFAULT_CENSUS formType until it is implemented
          return formType != formTypes.DEFAULT_CENSUS
        })
      }
    },
    methods: {
      headers(formType) {
        let hdr = []

        if (formType != formTypes.CENSUS) {
          hdr = hdr.concat([{
            text: 'Order'
          }])
        }

        hdr = hdr.concat([{
          text: 'Actions'
        }, {
          text: 'Name',
          class: 'max-width'
        }])

        if (formType == formTypes.CENSUS) {
          hdr.push({
            text: 'Census type'
          })
        }

        hdr = hdr.concat([{
          text: 'Version',
          align: 'center'
        }])

        return hdr.map((h, i) => {
          h.sortable = false
          h.value = i
          h.class = h.class || 'small'
          return h
        });
      },
      toggleFormSkips(form) {
        this.formSkipsForm = form
        this.showFormSkips = !this.showFormSkips
      },
      formName(form: Form) {
        return TranslationService.getAny(form.nameTranslation, this.global.locale)
      },
      async addForm(type: formTypes) {
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
      async reorderForms(evt) {
        // bail early if nothing has changed or we're currently reordering the forms
        if (this.isLoading) return
        if (evt.newIndex === evt.oldIndex) {
          this.isDragging = false
          return
        }
        this.isLoading = true
        let tempStudyForms = this.studyFormsByType[formTypes.DATA_COLLECTION_FORM].sort((a, b) => a.sortOrder - b.sortOrder).map((sf) => { return { id: sf.id, sortOrder: undefined } })
        let shifted = tempStudyForms[evt.oldIndex]
        tempStudyForms.splice(evt.oldIndex, 1)
        tempStudyForms.splice(evt.newIndex, 0, shifted)
        for (let i = 0; i < tempStudyForms.length; i++) {
          tempStudyForms[i].sortOrder = i + 1
        }
        try {
          const forms = await FormService.reorderForms(this.global.study.id, tempStudyForms)
          this.studyForms = forms
          this.sortBy = 'sortOrder'
          this.alert('success', this.$t('resource_updated', [this.$t('forms')]))
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_update', [this.$t('forms')]))
          }
          // TODO: Should probably return to the original order here
        } finally {
          await delay(1000)
          this.isDragging = false
          this.isLoading = false
        }
      },
      formImported(importedForm: Form) {
        this.studyForms.push(importedForm)
      },
      async updateForm(form: Form) {
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
      async changeStudyForm(studyForm: StudyForm) {
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
      async updateStudyForm(studyForm: StudyForm) {
        const index = this.studyForms.findIndex(sf => sf.id === studyForm.id)
        if (index > -1) {
          studyForm.form = this.studyForms[index].form
          this.studyForms[index] = studyForm
        }
      },
      async loadForms() {
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
      formTypeName(formType: formTypes) {
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
      async deleteForm(studyForm: StudyForm) {
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
  // .small
  //   column-width: 90px
</style>
