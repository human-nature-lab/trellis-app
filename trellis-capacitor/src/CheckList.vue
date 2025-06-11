<template>
  <v-list dense>
    <v-list-item
      v-for="item in items"
      :key="item[1]"
    >
      <v-list-item-action>
        <v-simple-checkbox
          :value="item[0]"
          :disabled="true"
        />
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>{{ item[1] }}</v-list-item-title>
        <v-list-item-subtitle v-if="item[2]">
          <ul>
            <li
              v-for="subItem in item[2]"
              :key="subItem[1]"
            >
              <input
                type="checkbox"
                :checked="subItem[0]"
                disabled
              >
              <label>{{ subItem[1] }}</label>
            </li>
          </ul>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  [true, 'Vue 2 + Vite'],
  [true, 'Vuetify 2'],
  [true, 'Android'],
  [true, 'TypeORM + SQLite', [
    [true, 'Transactions'],
    [true, 'Multi-database support'],
    [true, 'Pragma support'],
  ]],
  [false, 'zip plugin (CORDOVA ONLY! NATIVE SUPPORT IS BAD, but can use other plugins)'],
  [true, 'Camera'],
  [true, 'File Upload'],
  [false, 'Sync'],
  [false, 'gps (native)'],
  [false, 'insomnia equivalent (Community Plugin called keep-awake)'],
  [false, 'cordova-plugin-file-md5 (CORDOVA ONLY!)'],
  [false, 'cordova-plugin-google-nearby-connections (CCORDOVA ONLY!)'],
  [false, 'cordova-plugin-media-capture (CORDOVA ONLY! Partial support with @capacitor/camera & @capacitor-community/video-recorder)'],
  [true, 'cordova-plugin-device (Native)'],
  [true, 'cordova-plugin-file-transfer (Native)'],
  [false, 'cordova-plugin-media'],
  [false, '@red-mobile/cordova-plugin-barcodescanner (Native called @capacitor/barcode-scanner)'],
  [false, 'Automated builds'],
])
</script>
