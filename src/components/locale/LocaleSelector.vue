<template>
  <v-select
    :label="$t('locale')"
    :value="value"
    @input="$emit('input', $event)"
    :items="locales"
    :disabled="loading"
    item-text="languageName"
    item-value="id"
    :loading="loading" />
</template>

<script lang="ts">
import Locale from '../../entities/trellis/Locale'
import Vue, { PropOptions } from 'vue'
import LocaleService from '../../services/locale/LocaleService'

export default Vue.extend({
  name: 'LocaleSelector',
  props: {
    value: Object as PropOptions<Locale>,
    studyId: String,
  },
  data() {
    return {
      locales: [] as Locale[],
      loading: false,
    }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        this.locales = await LocaleService.getStudyLocales(this.studyId)
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style lang="sass">

</style>