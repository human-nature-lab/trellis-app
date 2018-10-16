<template>
  <v-container fluid grid-list-xs class="ma-0 pa-0">
    <v-toolbar flat>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <AddPhoto v-if="allowAdding" @photo="onAddPhoto"/>
    </v-toolbar>
    <v-layout row align-content-start wrap>
      <v-flex
        xs3
        v-for="photo in photos"
        :key="photo.id">
        <Photo
          @click="showFull(photo)"
          :isCentered="true"
          height="height"
          :photo="photo"/>
      </v-flex>
      <v-flex v-if="photos.length === 0">{{$t('no_photos')}}</v-flex>
    </v-layout>
    <FullscreenPhoto :photo="fullPhoto" v-model="isFullOpen"/>
  </v-container>
</template>

<script>
  import Photo from './Photo'
  import AddPhoto from './AddPhoto'
  import FullscreenPhoto from './FullscreenPhoto'
  // import ModalTitle from '../ModalTitle'

  // TODO: Make it possible to remove photos. What should the UI look like for this?
  // TODO: Make it possible to reorder photos
  export default {
    components: {
      Photo,
      AddPhoto,
      FullscreenPhoto
    },
    data () {
      this._srcCache = {}
      return {
        isAddingPhoto: false,
        imageSources: () => [],
        numTimesLoaded: 0,
        fullPhoto: null,
        isFullOpen: false
      }
    },
    name: 'PhotoAlbum',
    props: {
      photos: {
        type: Array,
        default: () => []
      },
      width: {
        type: String,
        default: '250'
      },
      height: {
        type: String,
        default: '250'
      },
      title: {
        type: String,
        default: function () {
          return this.$t('photos')
        }
      },
      allowAdding: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      showFull (photo) {
        this.fullPhoto = photo
        this.isFullOpen = true
      },
      onAddPhoto (photo) {
        this.$emit('photo', photo)
      }
    }
  }
</script>

<style lang="sass">
  .photo-album-carousel-container
    height: 100%
    .photo-album-carousel-card
      height: 100% !important
      .photo-album-carousel
        height: 100%
    img
      max-width: 100%
      max-height: 100%
</style>
