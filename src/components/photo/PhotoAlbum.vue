<template>
  <v-container fluid grid-list-xs class="ma-0 pa-0 photo-album-container">
    <v-toolbar flat>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <AddPhoto v-if="allowAdding && global.offline" @photo="onAddPhoto"></AddPhoto>
    </v-toolbar>
    <v-progress-linear v-if="loading" :indeterminate="true"></v-progress-linear>
    <transition-group v-if="this.photos.length > 0" name="photo-cards" tag="div" class="layout row wrap">
      <v-flex
        xs6 sm6 md4 lg3 xl2
        v-for="photo in orderedPhotos"
        class="photo-flex"
        :key="photo.id">
        <v-card class="photo-vcard">
          <photo
            @click="showFull(photo)"
            :isCentered="true"
            width="100%"
            :photo="photo">
          </photo>
          <v-card-actions class="photo-actions">
            <v-btn v-if="allowSorting" icon color="amber" @click="setFavorite(photo)">
              <v-icon v-if="photo.pivot.sortOrder === 0" medium>mdi-star</v-icon>
              <v-icon v-else medium>mdi-star-outline</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" icon>
                  <v-icon medium>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-if="allowNotes">
                  <v-btn icon @click.native="editPhoto(photo)">
                    <v-icon medium>mdi-edit</v-icon>
                  </v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn icon @click.native="deletePhoto(photo)">
                    <v-icon medium>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
        </v-card>
      </v-flex>
    </transition-group>
    <v-flex v-if="photos.length === 0">{{$t('no_photos')}}</v-flex>
    <fullscreen-photo v-if="fullPhoto !== null" title="" :photo="fullPhoto" v-model="isFullOpen"></fullscreen-photo>
    <v-dialog scrollable v-if="editingPhoto !== null" v-model="showDialog" persistent max-width="500px">
      <v-card>
        <v-toolbar>
          <v-toolbar-title>
            {{ $t('notes') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field multi-line auto-grow textarea v-model="editingPhoto.pivot.notes"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click.native="editPhoto(null)">{{ $t('cancel') }}</v-btn>
          <v-btn text @click.native="updatePhotos(editingPhoto)">{{ $t('save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import Photo from './Photo'
  import AddPhoto from './AddPhoto'
  import FullscreenPhoto from './FullscreenPhoto'
  import orderBy from 'lodash/orderBy'
  import global from '../../static/singleton'

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
        editingPhoto: null,
        isFullOpen: false,
        showDialog: false,
        global: global
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
      },
      allowSorting: {
        type: Boolean,
        default: true
      },
      allowNotes: {
        type: Boolean,
        default: true
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      orderedPhotos: function () {
        return orderBy(this.photos, 'pivot.sortOrder')
      }
    },
    methods: {
      showFull (photo) {
        this.fullPhoto = photo
        this.isFullOpen = true
      },
      onAddPhoto (photo) {
        this.$emit('photo', photo)
      },
      setFavorite (photo) {
        for (let i = 0; i < this.photos.length; i++) {
          const p = this.photos[i]
          if (p === photo) {
            p.pivot.sortOrder = 0
          } else {
            p.pivot.sortOrder++
          }
        }
        // renumber photos before updating
        for (let i = 0; i < this.orderedPhotos.length; i++) {
          this.orderedPhotos[i].pivot.sortOrder = i
        }
        this.$emit('update-photos', this.photos)
      },
      editPhoto (photo) {
        this.editingPhoto = photo
        this.showDialog = (this.editingPhoto !== null)
      },
      updatePhotos () {
        this.editingPhoto = null
        this.$emit('update-photos', this.photos)
      },
      deletePhoto (photo) {
        this.$emit('delete-photo', photo)
      }
    }
  }
</script>

<style lang="sass">
  .photo-album-container
    min-height: 10em
  .photo-card
    position: relative
  .photo-flex
    transition: all 1s
    .photo-actions
      background: white
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
