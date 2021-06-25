<template>
  <td>
    <v-alert
      :value="true"
      type="error"
      outlined>
      <v-row wrap>
        <v-col>
          {{ error.error_message }}
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea
            readonly
            rows="10"
            :value="error.error_trace">
          </v-textarea>
        </v-col>
      </v-row>
    </v-alert>
  </td>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    name: 'UploadError',
    props: {
      error: Object
    }
  })
</script>