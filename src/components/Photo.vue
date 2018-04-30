<template>
  <v-flex class="photo" ref="container">
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary" />
    <img
      ref="img"
      :src="src"
      :alt="alt"
      v-if="isLoaded"
      v-scroll="loadOrCancelLoading"/>
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
        isLoading: false,
        randId: Math.random().toString(16)
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
    },
    mounted: function () {
      this.$nextTick(() => {
        this.loadOrCancelLoading()
      })
    },
    methods: {
      isWithinViewport: function () {
        if (!this.$refs.container) return false
        // let rect = this.$refs.container.getBoundingClientRect()
        return false
        // return (
        //   rect.top >= 0 &&
        //   rect.left >= 0 &&
        //   rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        //   rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        // )
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
      cancelLoad: function () {
        console.log('TODO: Cancel the currently loading source')
      },
      loadOrCancelLoading: function () {
        let inViewport = this.isWithinViewport()
        if (inViewport && !this.isLoading && !this.isLoaded) {
          this.loadSrc()
        } else if (this.isLoading && !inViewport) {
          this.cancelLoad()
        }
      }
    },
    computed: {
      shouldLoad: function () {
        return !this.isLoaded && !this.isLoading && this.isWithinViewport()
      }
    }
  }
</script>

<style lang="sass">
.photo.contained
  max-height: 100%
  max-width: 100%
  img
   max-height: 100%
   max-width: 100%
</style>
