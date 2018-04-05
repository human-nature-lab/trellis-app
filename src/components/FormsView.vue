<template>
    <v-flex xs12 sm6 offset-sm3>
      <v-list>
        <v-list-tile v-for="form in cForms" :key="form.id">
          <v-list-tile-action>
            <v-icon color="green darken-2" v-if="form.isComplete">check_circle</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="form.name" >{{form.name}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
</template>

<script>
  import translationService from '@/services/TranslationService'
  export default {
    name: 'forms-view',
    props: {
      forms: {
        type: Array
      }
    },
    data: function () {
      return {
        _forms: []
      }
    },
    computed: {
      cForms: function () {
        return this.forms.map(form => {
          form.name = form.name || translationService.getTranslated(form.name_translation)
          form.isComplete = form.survey && form.survey.completed_at
          return form
        }).sort(function (a, b) {
          return a.sort_order > b.sort_order
        })
      }
    }
  }
</script>

<style scoped>

</style>
