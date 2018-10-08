<template>
    <v-dialog
      lazy
      v-model="isOpen"
      full-width
      persistent>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Location</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container fluid>
            <v-layout>
              <v-flex v-if="state === 'detecting'">
                <v-progress-circular indeterminate />
                Detecting location
              </v-flex>
              <v-flex v-else-if="['position-unavailable', 'timeout'].indexOf(state) > -1">
                <span v-if="state === 'position-unavailable'">
                  Current position is unavailable
                </span>
                <span v-else>
                  Time out while retrieving position. Try moving near a window or going outdoors.
                </span>
                <v-btn v-if="lastKnownCoordinates" @click="useLastPosition">Use Last Position</v-btn>
                <v-btn @click="retry">Retry</v-btn>
              </v-flex>
              <v-flex v-else-if="state === 'found-location'">
                <v-icon color="success">check</v-icon>
                Your location was accessed successfully. {{lastKnownCoordinates}}
              </v-flex>
              <v-flex v-else-if="state === 'use-last-location'">
                Using last found location of: {{lastKnownCoordinates}}
              </v-flex>
              <v-flex v-else>
                Position is unavailable. Please enable location services.
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
  import GeoLocationService from '../../services/geolocation'

  const PositionError = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3
  }

  const data = {
    isOpen: false,
    lastKnownCoordinates: null,
    attempts: 0,
    maxAttempts: 3,
    state: 'detecting'
  }

  const dialogCloseDelay = 3000

  let vueInstance

  export function getCurrentPosition () {
    data.isOpen = true
    data.attempts = 0
    data.state = 'detecting'
    return new Promise((resolve, reject) => {
      if (!vueInstance) reject(new Error(`Location finder needs to be in the DOM already`))
      vueInstance.tryForPosition(resolve, reject)
    }).then(coords => {
      data.isOpen = false
      debugger
      return coords
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
      useLastPosition () {
        this.resolve(this.lastKnownCoordinates)
      },
      retry () {
        this.getPosition().then(pos => {
          this.state = 'found-location'
          setTimeout(() => {
            debugger
            this.resolve(pos)
          }, dialogCloseDelay)
        }).catch(err => {
          if (err.code === PositionError.PERMISSION_DENIED) {
            this.state = 'permission-denied'
            console.error('Permission denied')
            setTimeout(() => {
              this.resolve(null)
            }, dialogCloseDelay)
          } else if (this.attempts >= this.maxAttempts) {
            this.state = 'exceeded-max'
            setTimeout(() => {
              console.error('Too many attempts')
              this.resolve(null)
            }, dialogCloseDelay)
          } else if (err.code === PositionError.TIMEOUT) {
            this.state = 'timeout'
          } else {
            this.state = 'position-unavailable'
          }
          console.log('location finder state', this.state)
        })
      },
      getPosition () {
        this.attempts++
        return GeoLocationService.getCurrentPosition().then(pos => {
          this.lastKnownCoordinates = pos.coords
          return pos.coords
        })
      }
    }
  }
</script>

<style scoped>

</style>
