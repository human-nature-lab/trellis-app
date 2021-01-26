<template>
  <span>
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-on="on" v-bind="attrs" @click="photoFromCamera" icon>
          <v-progress-circular v-if="isAddingPhoto" indeterminate />
          <v-icon v-else>add</v-icon>
        </v-btn>
      </template>
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
