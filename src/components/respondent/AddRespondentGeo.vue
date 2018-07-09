<template>
  <v-container fluid>
    <h2>Adding geo to {{respondentName}}</h2>
  </v-container>
</template>

<script>
  import RespondentNameMixin from '../../mixins/RespondentNameMixin'
  export default {
    name: 'add-respondent-geo',
    mixins: [RespondentNameMixin],
    props: {
      respondent: Object,
      geo: {
        type: Object,
        default: () => ({
          name: null,
          geoType: null
        })
      }
    },
    created () {

    }
    methods: {
      save () {
        debugger
      }
    }
  }
</script>

<style scoped>

</style>
