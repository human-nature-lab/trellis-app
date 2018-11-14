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
                {{$t('detecting_location')}}
              </v-flex>
              <v-flex v-else-if="['position-unavailable', 'timeout'].indexOf(state) > -1">
                <v-layout>
                  <v-flex v-if="state === 'position-unavailable'">
                    {{$t('position_unavailable')}}
                  </v-flex>
                  <v-flex v-else>
                    {{$t('position_timeout')}}
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-flex>
                    {{$t('position_fail_hint')}}
                  </v-flex>
                </v-layout>
                <v-layout>
                  <v-spacer></v-spacer>
                  <v-btn v-if="lastKnownCoordinates" @click="useLastPosition">
                    {{$t('use_last_position')}}
                  </v-btn>
                  <v-btn @click="skip">
                    {{$t('skip')}}
                  </v-btn>
                  <v-btn @click="retry">
                    {{$t('retry')}}
                  </v-btn>
                </v-layout>
              </v-flex>
              <v-flex v-else-if="state === 'found-location'">
                <v-layout>
                  <v-flex>
                    <v-icon color="success">check</v-icon>
                  </v-flex>
                  <v-flex>{{$t('position_success')}}</v-flex>
                </v-layout>
                <v-layout>
                  Lat: {{lastKnownCoordinates.latitude}} Long: {{lastKnownCoordinates.longitude}}
                </v-layout>
              </v-flex>
              <v-flex v-else-if="state === 'expired-location'">
                <v-layout row>
                  <v-flex>{{$t('last_known_position', [`Lat: ${lastKnownCoordinates.latitude}, Long: ${lastKnownCoordinates.longitude}`])}}</v-flex>
                  <v-spacer></v-spacer>
                  <v-flex>{{lastKnownTime.fromNow()}}</v-flex>
                </v-layout>
                <v-layout>
                  <v-spacer></v-spacer>
                  <v-btn v-if="lastKnownCoordinates" @click="useLastPosition">
                    {{$t('use_last_position')}}
                  </v-btn>
                  <v-btn @click="skip">
                    {{$t('skip')}}
                  </v-btn>
                  <v-btn @click="retry">
                    {{$t('retry')}}
                  </v-btn>
                </v-layout>
              </v-flex>
              <v-flex v-else-if="state === 'use-last-location'">
                {{$t('last_known_position', [lastKnownCoordinates])}}
              </v-flex>
              <v-flex v-else>
                {{$t('update_location_denied')}}
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
  import * as moment from 'moment'
  import GeoLocationService from '../services/geolocation/index'

  const PositionError = {
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3
  }

  const data = {
    isOpen: false,
    lastKnownCoordinates: null,
    lastKnownTime: 0,
    attempts: 0,
    maxAttempts: 3,
    state: 'detecting',
    tolerance: 5 * 60 * 1000
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
      skip () {
        this.resolve(null)
      },
      async useLastPosition () {
        const lastPos = await GeoLocationService.getLatestPosition()
        this.resolve(lastPos.coords)
      },
      retry () {
        this.state = 'detecting'
        this.getPosition().then(pos => {
          this.state = 'found-location'
          setTimeout(() => {
            this.resolve(pos.coords)
          }, dialogCloseDelay)
        }).catch(err => {
          this.log(err)
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
        const tol = 5 * 60 * 1000
        return GeoLocationService.getLocationTolerance(tol).then(pos => {
          this.lastKnownCoordinates = pos.coords
          this.lastKnownTime = moment(pos.timestamp)
          return pos
        })
      }
    }
  }
</script>

<style scoped>

</style>
