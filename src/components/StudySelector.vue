<template>
  <v-flex>
    <v-alert color="error" v-if="error">
      {{error}}
    </v-alert>
    <debug name="Studies">
      <pre>{{studies}}</pre>
    </debug>
    <v-select
      :label="$t('study')"
      :loading="isWorking"
      v-model="study"
      @change="change"
      item-text="name"
      item-value="id"
      :items="studies">
    </v-select>
  </v-flex>
</template>

<script>
  import StudyService from '../services/study/StudyService'
  export default {
    name: 'study-selector',
    data () {
      return {
        error: null,
        studies: [],
        study: null,
        isWorking: false
      }
    },
    created () {
      this.load()
    },
    methods: {
      change (studyId) {
        const study = this.getStudyById(studyId)
        this.study = study
        StudyService.setCurrentStudy(study)
        this.$emit('change', study)
      },
      async load () {
        try {
          this.isWorking = true
          // await SingletonService.hasLoaded()
          this.study = await StudyService.getCurrentStudy()
          this.studies = await StudyService.getMyStudies()
          this.studies.sort(function (a, b) {
            return b.name.localeCompare(a.name)
          })
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Failed to load studies')
          }
        } finally {
          this.isWorking = false
        }
      },
      getStudyById (studyId) {
        for (let i = 0; i < this.studies.length; i++) {
          if (this.studies[i].id === studyId) {
            return this.studies[i]
          }
        }
        return null
      }
    }
  }
</script>

<style scoped>

</style>
