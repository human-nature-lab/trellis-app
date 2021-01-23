<template>
  <tr class="form-list-row">
    <td class="small" v-if="Number(formType) !== formTypes.CENSUS" >
      <v-icon class="drag-handle">drag_handle</v-icon>
    </td>
    <td v-if="Number(formType) !== formTypes.CENSUS">
      <v-text-field
        :value="studyForm.sortOrder"
        hide-details
        single-line
        readonly
        type="number"
        @change="changeSortOrder"></v-text-field>
    </td>
    <td class="small">
      <v-menu
        offset-x
        lazy
        v-model="showMenu">
        <v-list-tile-action slot="activator">
          <v-btn
            :disabled="isBusy"
            @click.stop.prevent="showMenu = !showMenu"
            icon>
            <TrellisLoadingCircle
              v-if="isBusy"
              size="100%"></TrellisLoadingCircle>
            <v-icon v-else>more_vert</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list>
          <Permission :requires="TrellisPermission.EDIT_FORM">
            <v-list-tile :to="{name: 'FormBuilder', params: {formId: form.id, mode: 'builder'}}">
              <v-list-tile-content>
                Edit
              </v-list-tile-content>
            </v-list-tile>
          </Permission>
          <v-list-tile :to="{name: 'InterviewPreview', params: {formId: form.id}}">
            <v-list-tile-content>
              Preview
            </v-list-tile-content>
          </v-list-tile>
            <!--v-list-tile :to="{name: 'FormBuilder', params: {formId: form.id, mode: 'print'}}">
              <v-list-tile-content>
                Print
              </v-list-tile-content>
            </v-list-tile-->
          <v-list-tile @click="exportForm">
            <v-list-tile-content>
              Export
            </v-list-tile-content>
          </v-list-tile>
          <Permission :requires="TrellisPermission.REMOVE_FORM">
            <v-list-tile @click="$emit('delete')">
              <v-list-tile-content>
                <span class="error--text">Delete</span>
              </v-list-tile-content>
            </v-list-tile>
          </Permission>
        </v-list>
      </v-menu>
    </td>
    <td>
      <TranslationTextField :translation="memForm.nameTranslation" @click.stop.prevent></TranslationTextField>
    </td>
    <td v-if="Number(formType) === formTypes.CENSUS" style="min-width: 20em;">
      <v-select
        :items="censusTypes"
        v-model="studyForm.censusTypeId"
        @change="changeCensusType"
        box
        label="Census type"></v-select>
    </td>
    <td>
      <v-checkbox v-model="memForm.isPublished" @change="save"></v-checkbox>
    </td>
    <td>
      <v-btn icon @click="$emit('input', !value)">
        <v-icon v-if="value">keyboard_arrow_up</v-icon>
        <v-icon v-else>keyboard_arrow_down</v-icon>
      </v-btn>
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Form from '../../entities/trellis/Form'
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'
  import Permission from '../Permission'
  // @ts-ignore
  import TranslationTextField from '../TranslationTextField'
  // @ts-ignore
  import TrellisLoadingCircle from '../TrellisLoadingCircle'
  import FormService from '../../services/form/FormService'
  import debounce from 'lodash/debounce'
  import formTypes from '../../static/form.types'
  import censusTypes from '../../static/census.types'
  import StudyForm from '../../entities/trellis/StudyForm'

  export default Vue.extend({
    name: 'form-list-tile',
    components: {
      AsyncTranslationText,
      TranslationTextField,
      TrellisLoadingCircle,
      Permission
    },
    data () {
      return {
        isBusy: false,
        formTypes,
        showMenu: false,
        isOpen: false,
        memForm: this.form.copy(),
        saveThrottled: debounce(async () => {
          this.$emit('save', this.memForm)
        }, 2000)
      }
    },
    props: {
      form: Object as () => Form,
      studyForm: Object as () => StudyForm,
      formType: String,
      value: {
        type: Boolean
      }
    },
    watch: {
      form (newForm: Form) {
        this.memForm = newForm.copy()
      }
    },
    computed: {
      censusTypes () {
        let returnTypes = []
        for (let censusType in censusTypes) {
          returnTypes.push({
            text: this.$t(censusType),
            value: censusTypes[censusType]
          })
        }
        return returnTypes
      }
    },
    methods: {
      idFrom (key: string): string {
        return key + '-' + this.form.id
      },
      printForm () {},
      async exportForm () {
        this.isBusy = true
        try {
          await FormService.exportForm(this.form.id)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to export form')
          }
        } finally {
          this.isBusy = false
        }
      },
      save () {
        this.$emit('save', this.memForm)
      },
      changeSortOrder (sortOrder) {
        let sf = this.studyForm.copy()
        sf.sortOrder = sortOrder
        this.$emit('updateStudyForm', sf)
      },
      changeCensusType (censusTypeId) {
        let sf = this.studyForm.copy()
        sf.censusTypeId = censusTypeId
        this.$emit('updateStudyForm', sf)
      }
    }
  })
</script>

<style lang="sass">
  .small
    width: 20px
  .drag-handle
    cursor: grab
</style>
