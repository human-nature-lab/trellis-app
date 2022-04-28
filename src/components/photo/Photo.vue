<template>
  <v-flex
    class="photo"
    :class="{contained: isContained, centered: isCentered}"
    ref="container"
    :style="photoStyles"
    @click="$emit('click', $event)">
    <TrellisLoadingCircle
      v-if="isLoading"
      color="primary">
    </TrellisLoadingCircle>
    <img
      ref="img"
      :src="src"
      :alt="alt"
      v-if="srcLoaded" />
  </v-flex>
</template>

<script>
  import PhotoService from '../../services/photo'
  import URL_PLACEHOLDER from '../../assets/baseline-image-24px.svg'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'

  const observer = new IntersectionObserver(handleIntersections, {
    threshold: 0.5
  })

  function handleIntersections (entries) {
    entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    for (let entry of entries) {
      let vm = entry.target.__vue__
      if (vm) {
        if (entry.isIntersecting) {
          vm.load()
        } else {
          vm.cancelLoad()
        }
      }
    }
  }

  export default {
    name: 'photo',
    components: {TrellisLoadingCircle},
    props: {
      photo: {
        type: Object
      },
      photoId: {
        type: String
      },
      isBuilding: {
        type: Boolean,
        'default': false
      },
      isContained: {
        type: Boolean,
        'default': false
      },
      isCentered: {
        type: Boolean,
        'default': false
      },
      showAlt: {
        type: Boolean,
        'default': true
      },
      width: {
        type: String
      },
      height: {
        type: String
      },
      immediate: {
        type: Boolean,
        default: false
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
        loadingError: null,
        cancel_: null
      }
    },
    mounted () {
      if (!this.immediate){
        observer.observe(this.$refs.container)
      } else {
        this.load()
      }
      this.resetPhoto()
    },
    watch: {
      photo () {
        if (this.id !== (this.photo ? this.photo.id : this.photoId)) {
          this.resetPhoto()
        }
      },
      photoId () {
        if (this.id !== (this.photo ? this.photo.id : this.photoId)) {
          this.resetPhoto()
        }
      }
    },
    beforeDestroy: function () {
      // console.log('removing scroll listener')
      observer.unobserve(this.$refs.container)
      this.cancelLoad()
    },
    methods: {
      resetPhoto () {
        this.id = this.photo ? this.photo.id : this.photoId
        if (this.showAlt && this.photo && this.photo.alt) {
          this.alt = this.photo.alt
        }
        this.cancelLoad()
        this.srcLoading = false
        this.srcLoaded = false
        this.imgLoading = false
        this.imgLoaded = false
      },
      setSrc (src) {
        this.src = src
        this.srcLoaded = true
        this.srcLoading = false
        this.imgLoading = true
        this.$nextTick(() => {
          let _this = this
          let img = this.$refs.img
          if (!img) return

          // Handle images that are already loaded before the nextTick
          if (img.complete && img.naturalWidth !== 0) {
            this.imgLoading = false
            this.imgLoaded = true
            return
          }

          img.addEventListener('load', function () {
            _this.imgLoading = false
            _this.imgLoaded = true
          })
          img.addEventListener('error', function () {
            _this.imgLoading = false
            _this.imgLoaded = true
          })
        })
      },
      setError (err) {
        this.srcLoaded = true
        this.imgLoaded = true
        this.srcLoading = false
        this.imgLoading = false
        this.setSrc(URL_PLACEHOLDER)
      },
      async load () {
        if (this.isLoaded) return
        if (!this.id) {
          return this.setError(new Error('No id present for this photo'))
        }
        if (!this.srcLoaded && !this.loadingError) {
          try {
            this.srcLoading = true
            const [p, cancel] = PhotoService.getPhotoSrc(this.id)
            this.cancel_ = cancel
            const src = await p
            this.setSrc(src)
          } catch (err) {
            if (this.isNotAuthError(err)) {
              if (err && err.message !== 'Cancelled image load') {
                this.log(err)
                this.setError(err)
                throw err
              }
            }
          }
        }
      },
      cancelLoad () {
        this.imgLoading = false
        this.srcLoading = false
        if (this.srcLoaded && this.imgLoaded) return
        if (this.cancel_) {
          this.srcLoading = false
          this.srcLoaded = false
          this.cancel_()
        }
        if (this.src && this.$refs && this.$refs.img) {
          this.src = null
          this.imgLoaded = false
          this.imgLoading = false
        }
      }
    },
    computed: {
      isLoaded: function () {
        return this.srcLoaded && this.imgLoaded
      },
      isLoading: function () {
        return this.srcLoading || this.imgLoading
      },
      hasError () {
        return !!this.loadingError
      },
      imgStyles () {
        let styles = {}
        if (this.width || this.height) {
          if (this.width && (this.width > this.height)) {
            styles.width = this.width + 'px'
            styles.height = 'auto'
          } else {
            styles.height = this.height + 'px'
            styles.width = 'auto'
          }
        }
        return styles
      },
      photoStyles () {
        let styles = {}
        if (this.width) {
          styles.width = this.width + 'px'
        }
        if (this.isCentered && this.height) {
          styles.height = this.height + 'px'
        } else if (this.height) {
          styles.minHeight = this.height + 'px'
        }
        return styles
      }
    }
  }
</script>

<style lang="sass">
.photo
  &.centered
    display: block
    overflow: hidden
    position: relative
    margin: auto
    /*background: black*/
    img
      display: block
      margin: auto
      width: auto
      height: auto
      max-width: 100%
      max-height: 100%
  &.contained
    max-height: 100%
    max-width: 100%
    flex-grow: 0
    img
     max-height: 100%
     max-width: 100%
</style>
