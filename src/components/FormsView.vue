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
  import FormListItem from './FormListItem'
  export default {
    name: 'forms-view',
    props: {
      forms: {
        type: Array
      }
    },
    data: function () {
      return {
        cForms: []
      }
    },
    created: function () {
      this.cForms = this.forms.map((form, i) => {
        form.nComplete = form.surveys.reduce((c, s) => (s.completed_at ? c + 1 : c), 0)
        form.isComplete = form.surveys.length && form.surveys[0].completed_at || false
        form.isStarted = form.surveys.length && !form.surveys[0].completed_at || false
        return form
      })
    },
    components: {
      FormListItem
    }
  }
</script>

<style lang="sass" scoped>

</style>
