<template>
  <!--<v-menu offset-y>-->
    <!--<v-btn slot="activator" icon>-->
      <!--<v-progress-circular v-if="isAddingPhoto" indeterminate />-->
      <!--<v-icon v-else>add</v-icon>-->
    <!--</v-btn>-->
    <!--<v-list>-->
      <!--<v-list-tile @click="photoFromCamera">-->
        <!--<v-list-tile-action>-->
          <!--<v-icon>photo_camera</v-icon>-->
        <!--</v-list-tile-action>-->
      <!--</v-list-tile>-->
      <!--<v-list-tile @click="photoFromFile">-->
        <!--<v-list-tile-action>-->
          <!--<v-icon>cloud_upload</v-icon>-->
        <!--</v-list-tile-action>-->
      <!--</v-list-tile>-->
    <!--</v-list>-->
  <!--</v-menu>-->
  <span>
    <v-tooltip lazy left>
      <v-btn slot="activator" @click="photoFromCamera" icon>
        <v-progress-circular v-if="isAddingPhoto" indeterminate />
        <v-icon v-else>add</v-icon>
      </v-btn>
      <span>{{$t('add_photos')}}</span>
    </v-tooltip>
  </span>
</template>

<script>
  import PhotoService from '../../services/photo/PhotoService'
  export default {
    name: 'AddPhoto',
    data () {
      return {
        isAddingPhoto: false
      }
    },
    methods: {
      async photoFromCamera () {
        this.isAddingPhoto = true
        try {
          const photo = await PhotoService.takePhoto()
          this.$emit('photo', photo)
        } catch (err) {
          console.error(err)
        } finally {
          this.isAddingPhoto = false
        }
      },
      async photoFromFile () {
        this.isAddingPhoto = true
        // TODO: Allow uploading photos from file
        alert("File upload not supported yet")
        this.isAddingPhoto = false
      },
    }
  }
</script>

<style scoped>

</style>
