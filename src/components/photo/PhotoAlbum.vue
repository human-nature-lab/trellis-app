<template>
  <v-container fluid grid-list-xs class="ma-0 pa-0">
    <v-toolbar flat>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <AddPhoto v-if="allowAdding" @photo="onAddPhoto"></AddPhoto>
    </v-toolbar>
    <transition-group name="photo-cards" tag="div" class="layout row wrap align-content-start">
      <v-flex
        xs6 sm6 md4 lg3 xl2
        v-for="photo in orderedPhotos"
        class="photo-flex"
        :key="photo.id">
        <v-card height="100%" class="photo-vcard">
          <v-card-media>
            <photo
              @click="showFull(photo)"
              :isCentered="true"
              width="100%"
              :photo="photo">
            </photo>
          </v-card-media>
          <v-card-actions class="photo-actions">
            <v-btn flat icon color="amber" @click="setFavorite(photo)">
              <v-icon v-if="photo.sortOrder === 0" medium>star</v-icon>
              <v-icon v-else medium>star_border</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <v-btn slot="activator" icon>
                <v-icon medium>more_vert</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile>
                  <v-btn icon>
                    <v-icon medium>edit</v-icon>
                  </v-btn>
                </v-list-tile>
                <v-list-tile>
                  <v-btn icon>
                    <v-icon medium>delete</v-icon>
                  </v-btn>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex v-if="photos.length === 0">{{$t('no_photos')}}</v-flex>
    </transition-group>
    <fullscreen-photo v-if="fullPhoto !== null" :photo="fullPhoto" v-model="isFullOpen"></fullscreen-photo>
  </v-container>
</template>

<script>
  import Photo from './Photo'
  import AddPhoto from './AddPhoto'
  import FullscreenPhoto from './FullscreenPhoto'
  import orderBy from 'lodash/orderBy'

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
        isFullOpen: false,
        photosWithMetaData: []
      }
    },
    created () {
      for (let i = 0; i < this.photos.length; i++) {
        const photo = this.photos[i]
        let sortOrder = i
        let notes = ''
        const metaData = this.photoMetaData.find((pmd) => pmd.photoId === photo.id)
        if (metaData !== undefined) {
          sortOrder = metaData.sortOrder
          notes = metaData.notes
        }
        const photoWithMetaData = {
          id: photo.id,
          fileName: photo.fileName,
          sortOrder: sortOrder,
          notes: notes
        }
        this.photosWithMetaData.push(photoWithMetaData)
      }
      console.log('this.photosWithMetaData', this.photosWithMetaData)
      console.log('this.orderedPhotos', this.orderedPhotos)
    },
    name: 'PhotoAlbum',
    props: {
      photos: {
        type: Array,
        default: () => []
      },
      photoMetaData: {
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
    computed: {
      orderedPhotos: function () {
        return orderBy(this.photosWithMetaData, 'sortOrder')
      }
    },
    methods: {
      showFull (photo) {
        this.fullPhoto = photo
        this.isFullOpen = true
      },
      onAddPhoto (photo) {
        const photoWithMetaData = {
          id: photo.id,
          fileName: photo.fileName,
          sortOrder: (this.photosWithMetaData.length - 1),
          notes: ''
        }
        this.photosWithMetaData.push(photoWithMetaData)
        this.$emit('photo', photo)
      },
      setFavorite (photo) {
        for (let i = 0; i < this.photosWithMetaData.length; i++) {
          const p = this.photosWithMetaData[i]
          if (p === photo) {
            p.sortOrder = 0
          } else {
            p.sortOrder++
          }
        }
        this.$emit('reorder-photos', this.photosWithMetaData)
      }
    }
  }
</script>

<style lang="sass">
  .photo-flex
    transition: all 1s
    .photo-vcard
      padding-bottom: 52px
    .photo-actions
      width: 100%
      position: absolute
      bottom: 0
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
