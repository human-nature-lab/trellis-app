<template>
    <v-card>
      <h2>Choose a locale</h2>
      <v-alert color="error" :value="error">
        {{error}}
      </v-alert>
      <v-select
        :loading="isWorking"
        v-model="locale"
        :items="locales"/>
    </v-card>
</template>

<script>
  import StudyService from '@/services/study/StudyService'
  import LocaleService from '@/services/locale/LocaleService'
  export default {
    name: 'locale-changer',
    data: function () {
      return {
        isWorking: false,
        study: null,
        locale_: null,
        error: null,
        locales: []
      }
    },
    created: function () {
      this.load()
    },
    updated: function () {
      this.load()
    },
    locale: {
      get: function () {
        return this.locale_
      },
      set: function (locale) {
        this.isWorking = true
        LocaleService.setCurrentLocale(locale).then((l) => {
          this.locale_ = locale
          this.error = null
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isWorking = false
        })
      }
    },
    methods: {
      load: function () {
        this.isWorking = true
        StudyService.getCurrentStudy().then(study => {
          this.study = study
          return LocaleService.getCurrentStudyLocales()
        }).then(locales => {
          this.locale = this.study.locales.find(locale => locale.id === this.study.default_locale_id)
          this.locales = locales
          this.error = null
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
