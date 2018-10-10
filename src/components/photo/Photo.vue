<template>
  <v-flex class="photo" :class="{contained: isContained}" ref="container" :style="{'width': width + 'px', 'min-height': height + 'px'}" @click="$emit('click')">
    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary" />
    <img
      ref="img"
      :src="src"
      :alt="alt"
      v-if="srcLoaded" />
  </v-flex>
</template>

<script>
  import PhotoService from '../../services/photo/PhotoService'
  import URL_PLACEHOLDER from '../../assets/Placeholder_person.jpg'

  // TODO: consider replacing this with a material design icon.
  // Material design icons can't be dynamically sized very well, so image is better. SVG would work though....
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
    props: {
      photo: {
        type: Object
      },
      photoId: {
        type: String
      },
      isContained: {
        type: Boolean,
        default: false
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
        loadingPromise: null,
        loadingError: null
      }
    },
    mounted () {
      observer.observe(this.$refs.container)
      this.id = this.photo ? this.photo.id : this.photoId
      if (this.showAlt && this.photo && this.photo.alt) {
        this.alt = this.photo.alt
      }
    },
    beforeDestroy: function () {
      // console.log('removing scroll listener')
      observer.unobserve(this.$refs.container)
      this.cancelLoad()
    },
    methods: {
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
          if (img.complete) {
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
        this.loadingError = err
        this.setSrc(URL_PLACEHOLDER)
      },
      load () {
        if (this.isLoaded) return
        if (!this.id) {
          this.setError(new Error('No id present for this photo'))
        }
        if (!this.srcLoaded && !this.loadingError) {
          this.srcLoading = true
          this.loadingPromise = PhotoService.getPhotoSrc(this.id).then(src => {
            this.setSrc(src)
          }).catch(err => {
            console.log('err', err)
            if (!(err && err.message && err.message === 'Canceled image load')) {
              this.setError(err)
            }
          })
        }
      },
      cancelLoad () {
        this.imgLoading = false
        this.srcLoading = false
        if (this.srcLoaded && this.imgLoaded) return
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
      }
    }
  }
</script>

<style lang="sass">
.photo.contained
  max-height: 100%
  max-width: 100%
  flex-grow: 0
  img
   max-height: 100%
   max-width: 100%
</style>
