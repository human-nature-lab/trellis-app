<template>
  <v-flex>
    <v-alert color="error" :value="error">
      {{error}}
    </v-alert>
    <debug name="Locales">
      <pre>{{locales}}</pre>
    </debug>
    <v-select
      :label="$t('locale')"
      :loading="isWorking"
      v-model="locale"
      @change="change"
      item-text="languageName"
      item-value="id"
      :items="locales">
    </v-select>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyService from '../services/study/StudyService'
  import LocaleService from '../services/locale/LocaleService'
  import SingletonService from '../services/singleton/SingletonService'
  export default Vue.extend({
    name: 'locale-selector',
    data: function () {
      return {
        error: null,
        locales: [],
        locale: null,
        isWorking: false
      }
    },
    created: function () {
      this.load()
    },
    methods: {
      change: function (localeId) {
        const locale = this.getLocaleById(localeId)
        this.locale = locale
        LocaleService.setCurrentLocale(locale)
        this.$emit('change', locale)
      },
      load: async function () {
        try {
          this.isWorking = true
          await SingletonService.hasLoaded()
          const study = await StudyService.getCurrentStudy()
          this.locales = await LocaleService.getStudyLocales(study.id)
          this.locale = await LocaleService.getCurrentLocale()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.isWorking = false
        }
      },
      getLocaleById: function (localeId) {
        for (let i = 0; i < this.locales.length; i++) {
          let locale = this.locales[i]
          if (locale.id === localeId) {
            return locale
          }
        }
        return null
      }
    }
  })
</script>

<style scoped>

</style>
