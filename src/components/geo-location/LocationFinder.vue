<template>
    <v-dialog lazy v-model="isOpen" full-width="">
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Location</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container fluid>
            <v-layout>
              <v-flex v-if="state === 'detecting'">
                {{$t('detecting_location_title')}}
              </v-flex>
              <v-flex v-else-if="state === 'retry'">
                Failed to detect location.
                <v-btn @click="tryForPosition">Retry</v-btn>
              </v-flex>
              <v-flex v-else-if="state === 'found-location'">
                Your location was accessed successfully. {{this.lastKnownCoordinates}}
              </v-flex>
              <v-flex v-else-if="state === 'use-last-location'">
                {{$t('use_last_location')}}
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
  import GeoLocationService from '../../services/geolocation'

  const data = {
    isOpen: false,
    lastKnownCoordinates: null,
    attempts: 0,
    maxAttempts: 3,
    state: 'detecting'
  }

  let vueInstance

  export function currentPosition () {
    data.isOpen = true
    data.attempts = 0
    data.state = 'detecting'
    return new Promise((resolve, reject) => {
      if (!vueInstance) reject(new Error(`Location finder needs to be in the DOM already`))
      vueInstance.tryForPosition(resolve, reject)
    })

  }

  export default {
    name: 'LocationFinder',
    data () {
      return data
    },
    beforeCreate () {
      vueInstance = this
    },
    beforeDestroy () {
      vueInstance = null
    },
    methods: {
      tryForPosition (resolve, reject) {
        this.resolve = resolve
        this.reject = reject
        this.retry()
      },
      retry () {
        this.getPosition().then(pos => {
          this.state = 'found-location'
          setTimeout(() => {
            this.resolve(pos)
          }, 2000)
        }).catch(err => {
          debugger
          if (this.attempts >= this.maxAttempts) {
            this.state = 'exceeded-max'
            setTimeout(() => {
              this.reject('Too many attempts')
            }, 1000)
          } else {
            this.state = 'retry'
          }
        })
      },
      getPosition () {
        this.attempts++
        return GeoLocationService.getCurrentPosition().then(pos => {
          this.lastKnownCoordinates = pos.coordinates
          return pos.coordinates
        })
      }
    }
  }
</script>

<style scoped>

</style>
