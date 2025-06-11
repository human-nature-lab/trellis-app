<template>
  <ul>
    <li v-for="item in items" :key="item[1]">
      <input
        type="checkbox"
        :checked="item[0]"
        disabled
      >
      <label>{{ item[1] }}</label>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  [true, 'Vue 2 + Vite'],
  [true, 'Vuetify 2'],
  [true, 'Android'],
  [false, 'TypeORM + SQLite'],
  [false, 'zip plugin'],
  [true, 'Camera'],
  [false, 'File Upload'],
  [false, 'Sync'],
  [false, 'gps'],
  [false, 'insomnia equivalent'],
  [false, 'cordova-plugin-google-nearby-connections'],
  [false, 'cordova-plugin-media-capture'],
  [false, 'cordova-plugin-file-transfer'],
  [false, 'cordova-plugin-media'],
  [false, '@red-mobile/cordova-plugin-barcodescanner'],
  [false, 'Automated builds'],
])
</script>
