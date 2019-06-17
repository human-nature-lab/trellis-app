<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title >
        <DocsLinkBadge to="reports/Importing.md">{{$t('data_import')}}</DocsLinkBadge>
      </v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-layout>
        <v-flex>
          <v-layout column>
            <GeoImport />
            <GeoPhotoImport />
            <RespondentGeoImport />
          </v-layout>
        </v-flex>
        <v-flex>
          <v-layout column align-content-end align-end>
            <RespondentImport />
            <RespondentPhotoImport />
            <RespondentConditionTagImport />
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DocsLinkBadge from '../documentation/DocsLinkBadge.vue'
  import GeoImport from '../import/GeoImport.vue'
  import GeoPhotoImport from '../import/GeoPhotoImport.vue'
  import RespondentConditionTagImport from '../import/RespondentConditionTagImport.vue'
  import RespondentImport from '../import/RespondentImport.vue'
  import RespondentPhotoImport from '../import/RespondentPhotoImport.vue'
  import RespondentGeoImport from '../import/RespondentGeoImport.vue'

  export default Vue.extend({
    name: 'DataImport',
    components: {
      GeoImport,
      GeoPhotoImport,
      RespondentImport,
      RespondentPhotoImport,
      DocsLinkBadge,
      RespondentConditionTagImport,
      RespondentGeoImport
    }
  })
</script>

<style lang="sass" scoped>
  .toolbar__title
    overflow: visible
</style>
