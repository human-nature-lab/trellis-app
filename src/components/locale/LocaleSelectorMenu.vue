<template>
  <v-menu offset-x offset-y close-on-content-click>
    <template #activator="{ attrs, on }">
      <slot name="activator" :attrs="attrs" :on="on" />
    </template>
    <v-list>
      <v-list-item
        v-if="locales"
        v-for="l in locales"
        :key="l.id"
        @click="onChange(l)"
      >{{ l.languageName }}</v-list-item>
      <v-list-item v-else-if="loading">{{ $t('loading') }}</v-list-item>
      <v-list-item v-else>{{ $t('no_results') }}</v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Locale from '../../entities/trellis/Locale'
import Vue, { PropOptions } from 'vue'
import LocaleService from '../../services/locale/LocaleService'

export default Vue.extend({
  name: 'LocaleSelectorMenu',
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
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        this.locales = await LocaleService.getStudyLocales(this.studyId)
      } finally {
        this.loading = false
      }
    },
    onChange(newLocale: Locale) {
      console.log('locale change', newLocale)
      this.$emit('input', newLocale)
    }
  }
})
</script>