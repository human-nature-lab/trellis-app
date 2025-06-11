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
