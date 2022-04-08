<template>
  <span class="geo-breadcrumbs">
    <span v-if="isLoading">
      Loading...
    </span>
    <span v-else-if="canNavigate">
      <router-link
        class="geo-name"
        :to="{name: 'Geo', params: {geoId: geo.id}}"
        v-for="geo in ancestors"
        :key="geo.id">
        <AsyncTranslationText :translation="geo.nameTranslation" />
      </router-link>
    </span>
    <span v-else>
      <span
        class="geo-name"
        v-for="geo in ancestors"
        :key="geo.id">
        <AsyncTranslationText :translation="geo.nameTranslation" />
      </span>
    </span>
  </span>
</template>

<script>
  import AsyncTranslationText from '../AsyncTranslationText.vue'
  import GeoService from '../../services/geo/GeoService'
  import singleton from '../../static/singleton'
  export default {
    name: 'geo-breadcrumbs',
    props: {
      geoId: {
        type: String,
        required: true
      },
      showAncestors: {
        type: Boolean,
        default: true
      },
      maxDepth: {
        type: Number,
        default: 0
      },
      canNavigate: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        global: singleton,
        isLoading: false,
        ancestors: []
      }
    },
    created () {
      this.load()
    },
    watch: {
      geoId (newId, oldId) {
        if (newId !== oldId) {
          this.load()
        }
      }
    },
    methods: {
      load () {
        if (!this.geoId) return
        this.isLoading = true
        GeoService.getGeoAncestors(this.geoId).then(ancestors => {
          this.ancestors = ancestors.slice()
          if (this.maxDepth) {
            this.ancestors.splice(0, this.ancestors.length - this.maxDepth)
          }
        }).catch(err => {
          if (this.isNotAuthError(err)) {
            this.logError(err, `Unable to load ancestors for geo: ${this.geoId}`)
          }
        }).finally(() => {
          this.isLoading = false
        })
      }
    },
    components: {AsyncTranslationText}
  }
</script>

<style lang="sass" scoped>
  .error
    color: red
  .geo-breadcrumbs
    .geo-name:not(:first-child):before
      content: ' \\ '
</style>
