<template>
  <v-flex class="photo contained" ref="container" :style="{'width': width + 'px', 'height': height + 'px'}">
    <v-progress-circular
      v-if="srcLoading || imgLoading"
      indeterminate
      color="primary" />
    <img
      ref="img"
      :src="src"
      :alt="alt"
      v-if="srcLoaded"/>
  </v-flex>
</template>

<script>
  import PhotoService from '@/services/photo/PhotoService'
  import ScrollListener from '@/services/ScrollListener'
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
      },
      width: {
        required: true
      },
      height: {
        required: true
      }
    },
    data: function () {
      return {
        src: '',
        id: '',
        alt: this.showAlt ? 'no alt' : null,
        srcLoading: false,
        srcLoaded: false,
        imgLoading: false,
        imgLoaded: false,
        randId: Math.random().toString(16),
        onViewportChange: () => {
          this.loadOrCancelLoading()
        }
      }
    },
    created: function () {
      ScrollListener.on('scroll', this.onViewportChange)
      window.addEventListener('resize', this.onViewportChange)
      this.id = this.photo ? this.photo.id : this.photoId
      if (this.showAlt && this.photo && this.photo.alt) {
        this.alt = this.photo.alt
      }
      if (!this.id) {
        return
      }
      this.loadOrCancelLoading()
    },
    beforeDestroy: function () {
      // console.log('removing scroll listener')
      ScrollListener.off('scroll', this.onViewportChange, true)
      window.removeEventListener('resize', this.onViewportChange)
      this.cancelLoad()
    },
    mounted: function () {
      this.loadOrCancelLoading()
    },
    methods: {
      isWithinViewport: function () {
        if (!this.$refs.container) return false
        let rect = this.$refs.container.getBoundingClientRect()
        return (rect.top >= 0 ||
            rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)) &&
          (rect.left >= 0 ||
            rect.right >= (window.innerWidth || document.documentElement.clientWidth)
        )
      },
      setSrc: function (src) {
        this.src = src
        this.srcLoaded = true
        this.srcLoading = false
        this.imgLoading = true
        this.$nextTick(() => {
          let _this = this
          this.$refs.img.addEventListener('load', function () {
            _this.imgLoading = false
            _this.imgLoaded = true
          })
        })
      },
      loadSrc: function () {
        this.srcLoading = true
        this.loadingPromise = PhotoService.getPhotoSrc(this.id).then(src => {
          this.setSrc(src)
        }).catch(err => {
          if (err && err.response && err.response.status === 404) {
            this.setSrc(URL_PLACEHOLDER)
          }
        })
      },
      cancelLoad: function () {
        if (this.loadingPromise && this.loadingPromise.cancel) {
          this.srcLoading = false
          this.srcLoaded = false
          this.loadingPromise.cancel()
        }
        if (this.src && this.$refs && this.$refs.img) {
          this.src = null
          this.imgLoaded = false
          this.imgLoading = false
        }
      },
      loadOrCancelLoading: function () {
        let inViewport = this.isWithinViewport()
        if (inViewport && !this.srcLoaded && !this.srcLoading) {
          this.loadSrc()
        } else if (!this.isLoaded && this.isLoading && !inViewport) {
          this.cancelLoad()
        }
      }
    },
    computed: {
      shouldLoad: function () {
        return !this.isLoaded && !this.isLoading && this.isWithinViewport()
      },
      isLoaded: function () {
        return this.srcLoaded && this.imgLoaded
      },
      isLoading: function () {
        return this.srcLoading || this.imgLoading
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
