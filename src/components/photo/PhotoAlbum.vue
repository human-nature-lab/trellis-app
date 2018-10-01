<template>
  <v-container fluid grid-list-xs class="ma-0 pa-0">
    <v-toolbar flat>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <permission :role-whitelist="['admin','supervisor','manager']">
        <AddPhoto v-if="allowAdding" @photo="onAddPhoto"/>
      </permission>
    </v-toolbar>
    <v-layout row align-content-start wrap>
      <v-flex xs3
              v-if="photos.length"
              v-for="photo in photos">
        <Photo
          @click="showAlbum(photo)"
          :is-contained="true"
          :height="height"
          :width="width"
          :key="photo.id"
          :photo="photo"/>
      </v-flex>
      <v-flex v-else>{{$t('no_photos')}}</v-flex>
    </v-layout>
    <v-dialog fullscreen lazy v-model="isAlbumOpen">
      <v-container class="photo-album-carousel-container">
        <v-card class="photo-album-carousel-card">
          <v-toolbar color="primary">
            <v-spacer />
            <v-btn icon @click="isAlbumOpen=false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-carousel :cycle="false" class="photo-album-carousel">
            <v-carousel-item
              :src="src"
              v-for="src in imageSources" />
          </v-carousel>
        </v-card>
      </v-container>
    </v-dialog>
  </v-container>
</template>

<script>
  import Photo from './Photo'
  import Permission from '../Permission'
  import AddPhoto from './AddPhoto'
  import PhotoService from '../../services/photo/PhotoService'
  import URL_PLACEHOLDER from '../../assets/Placeholder_person.jpg'
  export default {
    components: {
      Photo,
      AddPhoto,
      Permission
    },
    data () {
      this._srcCache = {}
      return {
        isAddingPhoto: false,
        isAlbumOpen: false,
        imageSources: () => [],
        numTimesLoaded: 0
      }
    },
    name: 'PhotoAlbum',
    props: {
      photos: {
        type: Array,
        default: () => []
      },
      width: {
        type: Number,
        default: 250
      },
      height: {
        type: Number,
        default: 250
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
      showAlbum () {
        this.isAlbumOpen = true
        this.updateSrcs()
      },
      async updateSrcs () {
        this.numTimesLoaded++
        const srcs = []
        const toLoad = []
        for (let photo of this.photos) {
          if (!this._srcCache[photo.id]) {
            toLoad.push(photo)
          }
          srcs.push(this._srcCache[photo.id] || URL_PLACEHOLDER)
        }
        this.imageSources = srcs
        if (toLoad.length && this.numTimesLoaded < 10) {
          await Promise.all(toLoad.map(p => this.loadPhotoSrc(p)))
          this.updateSrcs()
        } else {
          console.log('done loading photos', toLoad)
        }
      },
      onAddPhoto (photo) {
        let val = this.$emit('photo', photo)
      },
      async loadPhotoSrc (photo) {
        PhotoService.getPhotoSrc(photo.id).then(src => {
          this._srcCache[photo.id] = src
        })
      }
    },
    watch: {
      photos () {
        if (this.isAlbumOpen) {
          this.updateSrcs()
        }
      }
    }
  }
</script>

<style lang="sass" scoped>
  .photo-album-carousel-container
    height: 100%
    .photo-album-carousel-card
      height: 100% !important
      .photo-album-carousel
        height: 100%
</style>
