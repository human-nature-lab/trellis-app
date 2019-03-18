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
        <template slot="headers" slot-scope="props">
          <tr>
            <th class="small"></th>
            <th class="max-width">Form</th>
            <th>Published</th>
            <th class="small"></th>
          </tr>
        </template>
        <template slot="items" slot-scope="props">
          <FormListTile
            :form="props.item.form"
            v-model="props.showHidden"
            @input="changeMade()"
            @delete="deleteForm(studyForm)" />
           <tr v-if="props.showHidden">
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
  import FormService from '../services/form/FormService'
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
      this.isLoading = true
      const studyForms = await FormService.getAllStudyForms(global.study.id)
      const formBins = {}
      for (const studyForm of studyForms) {
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
    data () {
      return {
        global,
        formBins: {} as {[key: string]: Form[]},
        isAddingNewForm: false,
        isLoading: false,
        headers: [{
          text: ''
        }, {
          text: 'Form'
        }]
      }
    },
    methods: {
      async addForm (type: formTypes) {
        const form = await FormService.createForm(global.study.id, type)
        this.formBins[type].push(form)
      },
      updateForm (form: Form) {

      },
      saveNewForm () {

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
      async deleteForm (form: Form) {
        if (confirm('Really delete this form?')) {
          await FormService.deleteForm(global.study.id, form.id)
          const index = this.forms.findIndex(f => f.id === form.id)
          this.forms.splice(index, 1)
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
