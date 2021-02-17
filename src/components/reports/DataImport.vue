<template>
  <v-col>
    <v-toolbar>
      <v-toolbar-title >
        <DocsLinkBadge to="reports/Importing.md">{{$t('data_import')}}</DocsLinkBadge>
      </v-toolbar-title>
    </v-toolbar>
    <v-card>
      <v-row>
        <v-col>
          <GeoImport />
          <GeoPhotoImport />
          <RespondentGeoImport />
        </v-col>
        <v-col>
          <RespondentImport />
          <RespondentPhotoImport />
          <RespondentConditionTagImport />
        </v-col>
      </v-row>
    </v-card>
  </v-col>
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
