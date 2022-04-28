<template>
  <v-chip 
    v-bind="$attrs"
    v-on="$listeners"
    :close="close">
    <v-icon small class="mr-2">mdi-map-marker</v-icon>
    {{ loading || error ? $t('loading') : name }}
    <v-progress-circular v-if="loading" size="10" indeterminate class="ml-2" />
  </v-chip>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Geo from '../../entities/trellis/Geo'
  import GeoService from '../../services/geo'
  import TranslationService from '../../services/TranslationService'
  import global from '../../static/singleton'

  export default Vue.extend({
    name: 'GeoChip',
    props: {
      value: String,
      close: Boolean
    },
    data () {
      return {
        global,
        loading: false,
        geo: null as Geo,
        error: null
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        try {
          this.loading = true
          this.geo = await GeoService.getGeoById(this.value)
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }
      }
    },
    computed: {
      name (): string {
        return TranslationService.getTranslated(this.geo.nameTranslation, this.global.locale)
      }
    }
  })
</script>

<style lang="sass">
  
</style>