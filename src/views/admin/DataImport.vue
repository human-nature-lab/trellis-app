<template>
  <v-col class="w-full w-max-normal">
    <v-row>
      <h4 class="text-h4">
        {{ $t('data_import') }}
      </h4>
    </v-row>
    <v-row class="mt-4">
      <v-select
        v-model="type"
        :items="importItems"
        :label="$t('type')"
      />
      <v-btn @click="isVisible = true">
        {{ $t('import') }}
      </v-btn>
    </v-row>
    <component
      v-model="isVisible"
      :is="component"
    />
  </v-col>
</template>

<script lang="ts">
import Vue, { Component } from 'vue'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import PreloadImport from '@/components/import/PreloadImport.vue'
import RespondentImport from '@/components/import/RespondentImport.vue'
import GeoImport from '@/components/import/GeoImport.vue'
import GeoPhotoImport from '@/components/import/GeoPhotoImport.vue'
import RespondentGeoImport from '@/components/import/RespondentGeoImport.vue'
import RespondentPhotoImport from '@/components/import/RespondentPhotoImport.vue'
import RespondentConditionTagImport from '@/components/import/RespondentConditionTagImport.vue'

export default Vue.extend({
  name: 'DataImport',
  mixins: [DocsLinkMixin('reports/Importing.md')],
  data () {
    return {
      type: 'import_respondents',
      isVisible: false,
      imports: {
        import_respondents: RespondentImport,
        import_locations: GeoImport,
        import_location_photos: GeoPhotoImport,
        import_respondent_geos: RespondentGeoImport,
        import_preload_actions: PreloadImport,
        import_respondent_photos: RespondentPhotoImport,
        import_respondent_tags: RespondentConditionTagImport,
      } as Record<string, Component>,
    }
  },
  methods: {
    showImport (): void {
      console.log('showing')
    },
  },
  computed: {
    importItems (): object[] {
      return Object.keys(this.imports).map(i => ({
        text: this.$t(i),
        value: i,
      }))
    },
    component (): Component {
      return this.imports[this.type]
    },
  },
})
</script>

<style lang="sass">

</style>
