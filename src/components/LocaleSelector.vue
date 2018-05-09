<template>
  <v-flex>
    <v-alert color="error" :value="error">
      {{error}}
    </v-alert>
    <v-select
      :loading="isWorking"
      v-model="locale"
      @change="change"
      item-text="language_name"
      :items="locales"/>
  </v-flex>
</template>

<script>
  import StudyService from '../services/study/StudyService'
  import LocaleService from '../services/locale/LocaleService'
  export default {
    name: 'locale-selector',
    data: function () {
      return {
        error: null,
        locales: [],
        locale: LocaleService.getCurrentLocale(),
        isWorking: false
      }
    },
    created: function () {
      this.load()
    },
    methods: {
      change: function (locale) {
        this.locale = locale
        LocaleService.setCurrentLocale(this.locale)
        this.$emit('change', this.locale)
      },
      load: function () {
        this.isWorking = true
        StudyService.getCurrentStudy().then(study => {
          StudyService.setCurrentStudy(study)
          return LocaleService.getCurrentStudyLocales()
        }).then(locales => {
          if (!this.locale) {
            this.locale = locales.find(locale => locale.id === this.global.study.default_locale_id)
          }
          this.locales = locales
          this.error = null
        }).catch(err => {
          debugger
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
