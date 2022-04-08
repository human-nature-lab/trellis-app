<template>
  <v-flex>
    <debug name="Locales">
      <pre>{{locales}}</pre>
    </debug>
    <v-select
      :label="$t('locale')"
      :loading="isLoading"
      :error="error"
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
  import SingletonService from '../services/SingletonService'
  export default Vue.extend({
    name: 'locale-selector',
    data () {
      return {
        error: null,
        locales: [],
        locale: null,
        isLoading: false
      }
    },
    created () {
      this.load()
    },
    methods: {
      change (localeId) {
        const locale = this.getLocaleById(localeId)
        this.locale = locale
        LocaleService.setCurrentLocale(locale)
        this.$emit('change', locale)
      },
      async load () {
        try {
          this.isLoading = true
          // await SingletonService.hasLoaded()
          const study = await StudyService.getCurrentStudy()
          this.locales = await LocaleService.getStudyLocales(study.id)
          this.locale = await LocaleService.getCurrentLocale()
          this.error = null
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Failed to load locales')
          }
        } finally {
          this.isLoading = false
        }
      },
      getLocaleById (localeId) {
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
