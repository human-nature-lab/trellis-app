<template>
  <v-flex>
    <FormListItem
      v-for="form in cForms"
      :key="form.id"
      :form="form"
      @click="$emit('click', form)"/>
  </v-flex>
</template>

<script>
  import Vue from 'vue'
  import FormListItem from './FormListItem'

  export default Vue.extend({
    name: 'forms-view',
    props: {
      forms: {
        type: Array,
        required: true
      }
    },
    computed: {
      cForms () {
        return this.forms.map((form, i) => {
          form.nComplete = form.surveys.reduce((c, s) => (s.completedAt ? c + 1 : c), 0)
          form.isComplete = form.surveys.length && form.surveys[0].completedAt || false
          form.isStarted = form.surveys.length && !form.surveys[0].completedAt || false
          return form
        })
      }
    },
    components: {
      FormListItem
    }
  })
</script>

<style lang="sass" scoped>

</style>
