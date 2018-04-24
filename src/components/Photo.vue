<template>
  <v-flex class="photo">
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary" />
    <img
      :src="src"
      :alt="alt"
      v-if="!isLoading"
      v-scroll="loadIfNotLoaded()"/>
  </v-flex>
</template>

<script>
  import PhotoService from '@/services/photo/PhotoService'
  const URL_PLACEHOLDER = 'https://vignette.wikia.nocookie.net/prince-of-stride-alternative/images/1/14/Placeholder_person.jpg/revision/latest?cb=20160220192514'
  export default {
    name: 'photo',
    props: {
      photo: {
        type: Object
      },
      photoId: {
        type: String
      },
      showAlt: {
        type: Boolean,
        default: true
      }
    },
    data: function () {
      return {
        src: '',
        id: '',
        alt: this.showAlt ? 'no alt' : null,
        isLoaded: false,
        isLoading: false
      }
    },
    created: function () {
      this.id = this.photo ? this.photo.id : this.photoId
      if (this.showAlt && this.photo && this.photo.alt) {
        this.alt = this.photo.alt
      }
      if (!this.id) {
        return
      }
      this.loadIfNotLoaded()
    },
    methods: {
      isWithinViewport: function () {
        // TODO: Return true if any part of the photo element is within the viewport
        return true
      },
      loadSrc: function () {
        this.isLoading = true
        PhotoService.getPhotoSrc(this.id).then(src => {
          this.src = src
          this.isLoaded = true
        }).catch(err => {
          console.error(err)
          this.src = URL_PLACEHOLDER
        }).then(() => {
          this.isLoading = false
        })
      },
      loadIfNotLoaded: function () {
        if (this.shouldLoad) {
          this.loadSrc()
        }
      }
    },
    computed: {
      shouldLoad: function () {
        return !this.isLoaded && this.isWithinViewport()
      }
    }
  }
</script>

<style>

</style>
