<template>
  <v-flex>
    <v-alert color="error" :value="error">
      {{error}}
    </v-alert>
    <debug name="Studies">{{studies}}</debug>
    <v-select
      :loading="isWorking"
      v-model="study"
      @change="change"
      item-text="name"
      :items="studies"/>
  </v-flex>
</template>

<script>
  import StudyService from '../services/study/StudyService'
  export default {
    name: 'study-selector',
    data: function () {
      return {
        error: null,
        studies: [],
        study: null,
        isWorking: false
      }
    },
    created: function () {
      this.load()
    },
    methods: {
      change: function (study) {
        this.study = study
        StudyService.setCurrentStudy(this.study)
        this.$emit('change', this.study)
      },
      load: function () {
        this.isWorking = true
        return Promise.all([
          StudyService.getCurrentStudy(),
          StudyService.getMyStudies()
        ]).then(results => {
          let [study, studies] = results
          studies.sort(function (a, b) {
            return b.updated_at.localeCompare(a.updated_at)
          })
          this.study = study
          this.studies = studies
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isWorking = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
