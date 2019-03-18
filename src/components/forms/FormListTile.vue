<template>
  <tr :class="{expandable: isOpen}">
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
      <TranslationTextField :translation="memForm.nameTranslation" @click.stop.prevent="justCapture" />
    </td>
    <td>
      <v-chip
        @click.stop="memForm.isPublished = !memForm.isPublished"
        :color="memForm.isPublished ? 'success' : 'error'"
        text-color="white"
        small
        label>
        <v-avatar>
          <v-icon v-if="memForm.isPublished">check_circle</v-icon>
        </v-avatar>
        {{memForm.isPublished ? 'Published' : 'Unpublished'}}
      </v-chip>
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
        isBusy: false,
        isOpen: false,
        memForm: this.form.copy(),
        saveThrottled: debounce(async form => {

        }, 2000)
      }
    },
    props: {
      form: Object as () => Form,
      value: {
        type: Boolean
      }
    },
    watch: {
      form (newForm: Form) {
        // this.isBusy = false
        this.memForm = newForm.copy()
      },
      memForm: {
        handler (newVal: Form) {
          if (!CompareService.entitiesAreEqual(newVal, this.form)) {
            // this.isBusy = true
          } else if (this.isBusy) {
            // this.isBusy = false
            this.saveThrottled.cancel()
          }
        },
        deep: true
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
      }
    }
  })
</script>

<style lang="sass">
  .small
    width: 20px
</style>
