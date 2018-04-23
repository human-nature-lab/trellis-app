<template>
    <img :src="src" :alt="alt"/>
</template>

<script>
  import PhotoService from '@/services/photo/PhotoService'
  import _ from 'lodash'
  const URL_PLACEHOLDER = '/static/assets/logo.png'
  export default {
    name: 'photo',
    props: {
      photo: {
        type: Object
      },
      photoId: {
        type: String
      }
    },
    data: function () {
      return {
        src: '',
        id: '',
        alt: 'No alternative text provided for this photo'
      }
    },
    created: function () {
      if (!this.photo || !this.photoId) {
        throw Error('A photo object or photoId must be provided to use this component')
      }
      this.id = this.photo ? this.photo.id : this.photoId
      if (this.photo && this.photo.alt) {
        this.alt = this.photo.alt
      }
      if (this.isWithinViewport()) {
        this.loadSrc()
      } else {
        let onScroll = () => {
          if (this.isWithinViewport()) {
            this.loadSrc()
          }
        }
        window.addEventListener('scroll', _.debounce(onScroll, 500))
      }
    },
    methods: {
      isWithinViewport: function () {
        // TODO: Return true if any part of the photo element is within the viewport
        return true
      },
      loadSrc: function () {
        PhotoService.getPhotoSrc(this._id).then(src => {
          this.src = src
        }).catch(err => {
          console.error(err)
          this.src = URL_PLACEHOLDER
        })
      }
    }
  }
</script>

<style scoped>

</style>
