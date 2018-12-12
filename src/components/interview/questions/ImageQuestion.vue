<template>
  <photo-album
    :photos="photosWithPivotTable"
    @photo="addPhoto"
    @delete-photo="removePhoto"
    :allowAdding="!isQuestionDisabled"
    :allow-sorting="false"
    :allow-notes="false"></photo-album>
</template>

<script>
  import PhotoAlbum from '../../photo/PhotoAlbum'
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import PhotoService from '../../../services/photo/PhotoService'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'

  export default {
    components: {
      PhotoAlbum
    },
    computed: {
      photoIds () {
        return this.question.datum.data.map(d => d.photoId)
      },
      photosWithPivotTable () {
        let photosWithPivotTable = []
        for (let i = 0; i < this.question.datum.data.length; i++) {
          let d = this.question.datum.data[i]
          photosWithPivotTable.push({
            id: d.photoId,
            fileName: '',
            pivot: {
              id: d.id,
              sortOrder: d.sortOrder,
              notes: '',
              entityId: d.id,
              photoId: d.photoId
            }
          })
        }
        return photosWithPivotTable
      }
    },
    created () {
      this._hasChanged = false
      this._photoCache = new Map()
      this.loadPhotos()
    },
    data () {
      return {
        isLoading: false,
        photos: []
      }
    },
    methods: {
      async loadPhotos () {
        if (this.isLoading) {
          this._hasChanged = true
        }
        this.isLoading = true
        const toLoadIds = this.photoIds.filter(id => !this._photoCache.has(id))
        const loaded = await PhotoService.getPhotosByIds(toLoadIds)
        for (let photo of loaded) {
          this._photoCache.set(photo.id, photo)
        }
        this.photos = this.photoIds.map(id => this._photoCache.get(id))
        this.isLoading = false
        if (this._hasChanged) {
          this._hasChanged = false
          this.loadPhotos()
        }
      },
      addPhoto (photo) {
        this.action(AT.add_photo, {
          photo_id: photo.id,
          val: photo.id
        })
      },
      removePhoto (photo) {
        this.action(AT.remove_photo, {
          photo_id: photo.id,
          val: photo.id
        })
      }
    },
    mixins: [QuestionDisabledMixin, ActionMixin],
    name: 'ImageQuestion',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    watch: {
      'question.datum.data': function () {
        this.loadPhotos()
      }
    }
  }
</script>

<style scoped>

</style>
