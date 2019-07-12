<template>
  <tr>
    <td class="small">
      <v-menu
        offset-x
        max-width="60px"
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
            <v-list-tile :to="{name: 'FormBuilder', params: {formId: form.id}}">
              <v-icon>edit</v-icon>
            </v-list-tile>
          </Permission>
          <v-list-tile @click="printForm">
            <v-icon>print</v-icon>
          </v-list-tile>
          <v-list-tile
            @click="exportForm">
            <v-icon>save_alt</v-icon>
          </v-list-tile>
          <v-list-tile @click="$emit('delete')">
            <v-icon color="error">delete</v-icon>
          </v-list-tile>
        </v-list>
      </v-menu>
    </td>
    <td>
      <TranslationTextField :translation="memForm.nameTranslation" @click.stop.prevent></TranslationTextField>
    </td>
    <td v-if="formType == formTypes.CENSUS" style="min-width: 20em;">
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
      },
      isBusy: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      form (newForm: Form) {
        this.memForm = newForm.copy()
      }
    },
    computed: {
      censusTypes: function() {
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
        await FormService.exportForm(this.form.id)
        this.isBusy = false
      },
      save () {
        this.$emit('save', this.memForm)
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
</style>
