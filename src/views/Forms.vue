<template>
  <v-flex>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('forms') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="isAddingNewForm=true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear
        v-if="isLoading"
        indeterminate />
      <v-list>
        <FormListTile
          v-for="form in forms"
          :form="form"
          :key="form.id"
          @delete="deleteForm(form)"/>
      </v-list>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FormService from '../services/form/FormService'
  import global from '../static/singleton'
  import Form from "../entities/trellis/Form"
  import FormListTile from "../components/forms/FormListTile"
  export default Vue.extend({
    name: 'Forms',
    components: {FormListTile},
    async created () {
      this.isLoading = true
      const studyForms = await FormService.getStudyForms(global.study.id)
      studyForms.sort((a, b) => a.sortOrder - b.sortOrder )
      this.forms = studyForms.map(sf => sf.form)
      this.isLoading = false
    },
    data () {
      return {
        global,
        forms: [] as Form[],
        isAddingNewForm: false,
        isLoading: false
      }
    },
    methods: {
      updateForm (form: Form) {

      },
      saveNewForm () {

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

<style scoped>

</style>
