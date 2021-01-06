<template>
  <v-flex class="btn primary" >
      <div class="btn__content" 
      @click="setResetRecords('reset-records')">
        {{$t('Clear Records')}}
      </div>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
  name: 'ResetRecords',
  components: {},
  data() {
    return {
      selectedResetRecords: 'reset-records'
    };
  },
  methods: {
    setResetRecords(tab) {
      // TO DO: set updated_records.uploaded_at to null.
      this.selectedResetRecords = tab;
      this.alert('success', 'Reset records successfully')

    }
  }
})
</script>


<style scoped>

</style>