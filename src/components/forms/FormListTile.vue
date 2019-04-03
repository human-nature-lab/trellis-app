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
              size="100%"/>
            <v-icon v-else>more_vert</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list>
          <v-list-tile :to="{name: 'FormBuilder', params: {formId: form.id}}">
            <v-icon>edit</v-icon>
          </v-list-tile>
          <v-list-tile @click="printForm">
            <v-icon>print</v-icon>
          </v-list-tile>
          <v-list-tile
            @click="exportForm">
            <v-icon>save_alt</v-icon>
          </v-list-tile>
          <v-list-tile @click="$emit('delete')">
            <v-icon>delete</v-icon>
          </v-list-tile>
        </v-list>
      </v-menu>
    </td>
    <td>
      <TranslationTextField :translation="memForm.nameTranslation" @click.stop.prevent />
    </td>
    <td>
      <v-checkbox v-model="memForm.isPublished" @change="save" />
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
  // @ts-ignore
  import TranslationTextField from '../TranslationTextField'
  // @ts-ignore
  import TrellisLoadingCircle from '../TrellisLoadingCircle'
  import FormService from "../../services/form/FormService"
  import CompareService from "../../services/CompareService"
  import debounce from 'lodash/debounce'

  export default Vue.extend({
    name: 'FormListTile',
    components: {
      AsyncTranslationText,
      TranslationTextField,
      TrellisLoadingCircle
    },
    data () {
      return {
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
        debugger
        this.memForm = newForm.copy()
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
      justCapture () {
        debugger
      },
      save () {
        debugger
        this.$emit('save', this.memForm)
      }
    }
  })
</script>

<style lang="sass">
  .small
    width: 20px
</style>
