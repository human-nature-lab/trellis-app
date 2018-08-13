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
      item-text="language_name"
      :items="locales">
    </v-select>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyService from '../services/study/StudyService'
  import LocaleService from '../services/locale/LocaleService'
  export default Vue.extend({
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
      load: async function () {
        try {
          this.isWorking = true
          const study = await StudyService.getCurrentStudy()
          this.locales = await study.locales
          if (!this.locale) {
            // this.locale = this.locales.find(study.defaultLocale)
          }
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style scoped>

</style>
