<template>
  <td>
    <v-alert
      :value="true"
      type="error"
      outline>
      <v-layout row wrap>
        <v-flex>
          {{ error.error_message }}
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12>
          <div class="textarea-wrapper">
            <textarea
              readonly
              rows="10"
              :value="error.error_trace">
            </textarea>
          </div>
        </v-flex>
      </v-layout>
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