<template>
    <v-dialog
      v-model="isOpen"
      persistent>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Location</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-container fluid text-xs-center>
            <v-layout>
              <v-flex v-if="state === 'detecting'">
                <v-progress-circular indeterminate />
                {{$t('detecting_location')}}
                <v-layout v-if="showSkip">
                  <v-spacer />
                  <v-btn
                    @click="skip">
                    {{$t('skip')}}
                  </v-btn>
                </v-layout>
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
                <v-layout justify-space-around>
                  <v-flex>
                    <v-icon color="success">mdi-check</v-icon> {{$t('position_success')}}
                  </v-flex>
                </v-layout>
                <v-layout justify-space-around>
                  <v-flex>
                    <b>Latitude: </b>{{lastKnownCoordinates.latitude | toFixed(5)}}
                  </v-flex>
                </v-layout>
                <v-layout justify-space-around>
                  <v-flex>
                    <b>Longitude: </b>{{lastKnownCoordinates.longitude | toFixed(5)}}
                  </v-flex>
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
  import GeoLocationService from '../services/geolocation/index'
  import { FakePosition } from '../services/geolocation/GeoLocationAbstract'

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
    showSkip: false,
    isResolved: false,
    state: 'detecting',
    tolerance: 5 * 60 * 1000,
    skipAvailableDelay: 3000,
    dialogCloseDelay: 3 * 1000
  }

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
        this.isResolved = false
        this.resolver = resolve
        this.reject = reject
        this.retry()
      },
      resolve (...args) {
        if (!this.isResolved) {
          this.resolver.apply(null, args)
          this.isResolved = true
        }
      },
      skip () {
        this.resolve(null)
      },
      async useLastPosition () {
        const lastPos = await GeoLocationService.getLatestPosition()
        this.resolve(lastPos.coords)
      },
      async retry () {
        this.state = 'detecting'
        try {
          const pos = await this.getPosition()
          this.state = 'found-location'
          setTimeout(() => {
            this.resolve(pos.coords)
          }, this.dialogCloseDelay)
        } catch (err) {
          this.log(err)
          if (err.code === PositionError.PERMISSION_DENIED) {
            this.state = 'permission-denied'
            console.error('Permission denied')
            setTimeout(() => {
              this.resolve(null)
            }, this.dialogCloseDelay)
          } else if (this.attempts >= this.maxAttempts) {
            this.state = 'exceeded-max'
            setTimeout(() => {
              console.error('Too many attempts')
              this.resolve(null)
            }, this.dialogCloseDelay)
          } else if (err.code === PositionError.TIMEOUT) {
            this.state = 'timeout'
          } else {
            this.state = 'position-unavailable'
          }
        }
      },
      async getPosition () {
        this.showSkip = false
        this.attempts++
        const tol = 5 * 60 * 1000
        setTimeout(() => {
          this.showSkip = true
        }, this.skipAvailableDelay)
        try {
          const pos = await GeoLocationService.getLocationTolerance(tol)
          this.lastKnownCoordinates = pos.coords
          this.lastKnownTime = new Date(pos.timestamp)
          return pos
        } catch (err) {
          if (err && err.message && err.message.toLowerCase().startsWith('only secure origins are allowed')) {
            // necessary for dev over http
            this.lastKnownCoordinates = FakePosition.coords
            this.lastKnownTime = new Date(pos.timestamp)
            return FakePosition
          }
          throw err
        }
      }
    }
  }
</script>
