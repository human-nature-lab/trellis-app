<template>
  <v-flex>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ $t('forms') }}</v-toolbar-title>
        <v-spacer />
        <v-btn @click="isAddingNewForm=true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list>
        <v-list-tile
          v-for="form in forms"
          :key="form.id"
          :to="{name: 'FormBuilder', params: {formId: form.id}}">
          <v-list-tile-title>
            <AsyncTranslationText :translation="form.nameTranslation" />
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FormService from '../services/form/FormService'
  import global from '../static/singleton'
  // @ts-ignore
  import AsyncTranslationText from '../components/AsyncTranslationText'
  import Form from "../entities/trellis/Form"
  export default Vue.extend({
    name: 'Forms',
    components: {AsyncTranslationText},
    async created () {
      this.forms = (await FormService.getStudyForms(global.study.id)).map(sf => sf.form)
    },
    data () {
      return {
        global,
        forms: [] as Form[],
        isAddingNewForm: false
      }
    },
    methods: {
      updateForm (form: Form) {

      },
      saveNewForm () {

      }
    }
  })
</script>

<style scoped>

</style>
