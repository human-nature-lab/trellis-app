<template>
    <v-container class="ma-1" grid-list-sm fluid>
      <v-layout row wrap>
        <v-flex xs12 sm12 md6 lg6 xl6 v-for="cat in categories">
          <v-card :ripple="!!cat.to" tile :to="cat.to">
            <v-card-text>
              <v-container>
                <v-layout class="display-1 mb-2">{{cat.title}}</v-layout>
                <v-layout v-if="cat.component" :is="cat.component"></v-layout>
                <v-layout v-else row v-for="pair in cat.items">
                  <v-flex class="subheading">{{pair.key}}</v-flex>
                  <v-spacer />
                  <v-flex v-if="pair.component" class="text-sm-right body-2">
                    <component :is="pair.component"></component>
                  </v-flex>
                  <v-flex v-else class="text-sm-right body-2">
                    <span v-if="pair.val !== null">{{pair.val}}</span>
                    <v-progress-circular
                      v-else
                      color="primary"
                      indeterminate
                      :size="16" />
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
  import DeviceService from "../services/device/DeviceService"
  import GeoLocationService from '../services/geolocation'

  declare const VERSION: string
  import Vue, {Component} from 'vue'
  import global from '../static/singleton'
  import DatabaseService from '../services/database/DatabaseService'
  import PhotoService from "../services/photo/PhotoService"
  import {defaultLoggingService as logger} from '../services/logging/LoggingService'
  import {RawLocation} from "vue-router/types/router"
  import formatBytesFilter from '../filters/format-bytes.filter'
  import SyncService from "../services/SyncService"
  import moment from 'moment'
  import {TranslateResult} from "vue-i18n"

  interface KeyPair {
    key: TranslateResult
    val?: any,
    component?: Component
  }

  interface Category {
    title: TranslateResult
    items: KeyPair[]
    to?: RawLocation
    component?: Component
  }

  export default Vue.extend({
    name: 'TrellisInfo',
    data () {
      return {
        global,
        version: VERSION,
        categories: [] as Category[],
        imageFileCount: 0,
        photoEntries: 0,
        uploadFileCount: 0,
        uploadEntries: 0,
        logEntries: 0,
        deviceId: null,
        serverUrl: null,
        gpsInterval: null
      }
    },
    created () {
      this.loadDevice()
      this.loadStorage()
      this.loadUploads()
      this.loadLogs()
      this.loadGPS()
    },
    beforeDestroy () {
      if (this.gpsInterval) {
        clearInterval(this.gpsInterval)
      }
    },
    methods: {
      loadDevice () {
        const device = {
          key: this.$t('device_id'),
          val: null
        }
        const server = {
          key: this.$t('server_url'),
          val: null
        }
        this.categories.push({
          title: this.$t('device'),
          items: [{
            key: this.$t('version'),
            val: this.version
          }, device, server]
        })
        DeviceService.getUUID().then(id => {
          device.val = id
        })
        DatabaseService.getServerIPAddress().then(url => {
          server.val = url
        })
      },
      loadStorage () {
        const photoFiles = {
          key: this.$t('device_photos'),
          val: null
        }
        const photoEntries = {
          key: this.$t('db_photos'),
          val: null
        }
        const photosSize = {
          key: this.$t('size'),
          val: null
        }
        this.categories.push({
          title: this.$t('storage'),
          items: [photoFiles, photoEntries, photosSize]
        })
        PhotoService.getPhotoCount().then(c => photoEntries.val = c)
        PhotoService.getPhotoFileCount().then(c => photoFiles.val = c)
        PhotoService.getPhotosSize().then(size => {
          photosSize.val = formatBytesFilter(size)
        })
      },
      loadUploads () {
        const pendingPhotos = {key: this.$t('pending_photos'), val: null}
        const pendingRows = {key:  this.$t('pending_rows'), val: null}
        this.categories.push({
          title: this.$t('uploads'),
          items: [
            pendingPhotos,
            pendingRows
          ],
          to: {name: 'Sync'}
        })
        SyncService.getNewPhotosCount().then(c => pendingPhotos.val = c)
        DatabaseService.getUpdatedRecordsCount().then(c => pendingRows.val = c)
      },
      loadLogs () {
        const totalLogs = {key: this.$t('logs'), val: null}
        const uploaded = {key: this.$t('uploaded'), val: null}
        this.categories.push({
          title: this.$t('logs'),
          items: [
            totalLogs,
            uploaded
          ],
          to: {name: 'Logs'}
        })
        logger.getLogCount().then(c => totalLogs.val = c)
        logger.getUploadedCount().then(c => uploaded.val = c)
      },
      loadGPS () {
        const statusData = {
          classes: ['red', 'red--text'],
          status: this.$t('pending')
        }
        const status = {
          key: this.$t('status'),
          component: {
            template: '<v-chip label outline :class="classes">{{status}}</v-chip>',
            data () {return statusData}
          }
        }
        const updateData = {
          classes: ['yellow', 'green--text'],
          label: this.$t('pending')
        }
        const lastUpdate = {
          key: this.$t('last_updated'),
          component: {
            template: '<v-chip label outline :class="classes">{{label}}</v-chip>',
            data () {return updateData}
          }
        }
        this.categories.push({
          title: 'GPS',
          items: [status, lastUpdate],
          to: {name: 'LocationHistory'}
        })
        this.gpsInterval = setInterval(async () => {
          // TODO: Check that the latest update was at a reasonable time
          const isWorking = await GeoLocationService.hasPositionHistory()
          statusData.status = isWorking ? this.$t('working') : this.$t('pending')
          statusData.classes = isWorking ? ['green', 'green--text'] : ['red', 'red--text']
          const lastUpdatedPosition = await GeoLocationService.getLatestPosition()
          if (lastUpdatedPosition) {
            const lastUpdated = moment(lastUpdatedPosition.timestamp + 4000)
            const tol = 5 * 60 * 1000
            const withinTol = Date.now() - lastUpdatedPosition.timestamp < tol
            updateData.label = lastUpdated.fromNow()
            updateData.classes = withinTol ? ['green', 'green--text'] : ['red', 'red--text']
          } else {
            updateData.label = this.$t('none')
          }
        }, 2000)
      }
    }
  })
</script>

<style lang="sass" scoped>
  /*.card*/
    /*width:*/
</style>
