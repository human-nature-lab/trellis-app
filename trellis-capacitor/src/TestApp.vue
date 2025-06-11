<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Trellis w/ Vuetify</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <v-btn
              icon
              @click="takePhoto"
            >
              <v-icon>mdi-camera</v-icon>
          </v-btn>
            <v-btn
              icon
              @click="photo = null"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <CheckList />
      <v-img :src="photo" />
      <DBTest />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { SplashScreen } from '@capacitor/splash-screen'
import CheckList from './CheckList.vue'
import DBTest from './components/DBTest.vue'

onMounted(() => {
  console.log('onMounted')
  SplashScreen.hide()
})
const photo = ref<string | null>(null)
const takePhoto = async () => {
  const res = await Camera.getPhoto({
    quality: 100,
    allowEditing: false,
    source: CameraSource.Camera,
    saveToGallery: false,
    resultType: CameraResultType.Uri,
  })
  photo.value = res.webPath ?? null
}

</script>
