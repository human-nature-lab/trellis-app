<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('data_import')}}</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-layout wrap>
        <GeoImport />
        <GeoPhotoImport />
        <RespondentImport />
        <RespondentPhotoImport />
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import DocsLinkBadge from '../documentation/DocsLinkBadge.vue'
  import GeoImport from '../import/GeoImport.vue'
  import GeoPhotoImport from '../import/GeoPhotoImport.vue'
  import RespondentImport from '../import/RespondentImport.vue'
  import RespondentPhotoImport from '../import/RespondentPhotoImport.vue'

  export default Vue.extend({
    name: 'DataImport',
    components: { GeoImport, GeoPhotoImport, RespondentImport, RespondentPhotoImport, DocsLinkBadge }
  })
</script>
