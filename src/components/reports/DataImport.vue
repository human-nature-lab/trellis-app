<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('data_import')}}</v-toolbar-title>
    </v-toolbar>
    <v-container>
<<<<<<< HEAD
      <v-layout wrap>
        <GeoImport />
        <GeoPhotoImport />
        <RespondentImport />
        <RespondentPhotoImport />
=======
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
>>>>>>> Added importing of respondent locations and respondent condition tags. Removed login button from user sign up confirmation. Updated translations. Moved imports to the reports view.
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
