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
          @click="showAlbum(photo)"
          :is-contained="true"
          :height="height"
          :width="width"
          :photo="photo"/>
      </v-flex>
      <v-flex v-if="photos.length === 0">{{$t('no_photos')}}</v-flex>
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
  import AddPhoto from './AddPhoto'
  import PhotoService from '../../services/photo/PhotoService'
  import URL_PLACEHOLDER from '../../assets/Placeholder_person.jpg'

  // TODO: Make it possible to remove photos. What should the UI look like for this?
  // TODO: Make it possible to reorder photos
  // TODO: Get rid of image carousel and instead click on a single image to expand full screen. Image carousel is taking up too much cpu and memory
  export default {
    components: {
      Photo,
      AddPhoto
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
      rightClick (photo) {
        debugger
        photo.showMenu = true
      },
      async showAlbum () {
        await this.updateSrcs()
        this.isAlbumOpen = true
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
        console.log('sources', this.imageSources.length, toLoad.length)
        if (toLoad.length && this.numTimesLoaded < 10) {
          await Promise.all(toLoad.map(p => this.loadPhotoSrc(p)))
          this.updateSrcs()
        } else {
          console.log('done loading photos', toLoad)
        }
      },
      onAddPhoto (photo) {
        this.$emit('photo', photo)
      },
      async loadPhotoSrc (photo) {
        return PhotoService.getPhotoSrc(photo.id).then(src => {
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
