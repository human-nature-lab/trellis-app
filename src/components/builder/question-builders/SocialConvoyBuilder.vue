<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate />
  </v-container>
</template>

<style lang="sass">

</style>
