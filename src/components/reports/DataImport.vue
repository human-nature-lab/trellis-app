<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title >
        <DocsLinkBadge to="reports/Importing.md">{{$t('data_import')}}</DocsLinkBadge>
      </v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-row>
        <v-col>
          <GeoImport class="mb-2" />
          <GeoPhotoImport class="mb-2" />
          <RespondentGeoImport class="mb-2" />
          <PreloadImport class="mb-2" />
        </v-col>
        <v-col>
          <RespondentImport class="mb-2" />
          <RespondentPhotoImport class="mb-2" />
          <RespondentConditionTagImport class="mb-2" />
        </v-col>
      </v-row>
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
  import PreloadImport from '../import/PreloadImport.vue'

  export default Vue.extend({
    name: 'DataImport',
    components: {
        GeoImport,
        GeoPhotoImport,
        RespondentImport,
        RespondentPhotoImport,
        DocsLinkBadge,
        RespondentConditionTagImport,
        RespondentGeoImport,
        PreloadImport
    }
  })
</script>

<style lang="sass" scoped>
  .toolbar__title
    overflow: visible
</style>
