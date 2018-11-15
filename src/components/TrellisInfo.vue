<template>
    <v-container class="ma-1" grid-list-sm fluid>
      <v-layout row wrap>
        <v-flex xs6 v-for="cat in categories">
          <v-card :ripple="!!cat.to" tile :to="cat.to">
            <v-card-text>
              <v-container>
                <v-layout class="display-1 mb-2">{{cat.title}}</v-layout>
                <v-layout row v-for="pair in cat.items">
                  <v-flex class="subheading">{{pair.key}}</v-flex>
                  <v-spacer />
                  <v-flex
                    class="text-sm-right body-2"
                    v-if="pair.val !== null">{{pair.val}}</v-flex>
                  <v-progress-circular
                    v-else
                    color="primary"
                    indeterminate
                    :size="16" />
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

  declare const VERSION: string
  import Vue from 'vue'
  import global from '../static/singleton'
  import DatabaseService from '../services/database/DatabaseService'
  import PhotoService from "../services/photo/PhotoService"
  import {defaultLoggingService as logger} from '../services/logging/LoggingService'
  import {RawLocation} from "vue-router/types/router"
  import formatBytesFilter from '../filters/format-bytes.filter'

  interface KeyPair {
    key: string
    val: any
  }

  interface Category {
    title: string
    items: KeyPair[]
    to?: RawLocation
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
        serverUrl: null
      }
    },
    created () {
      this.loadDevice()
      this.loadStorage()
      this.loadUploads()
      this.loadLogs()
    },
    methods: {
      loadDevice () {
        const device = {
          key: 'Device Id',
          val: null
        }
        const server = {
          key: 'Server URL',
          val: null
        }
        this.categories.push({
          title: "Device",
          items: [{
            key: 'Version',
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
          key: 'Device Photos',
          val: null
        }
        const photoEntries = {
          key: 'DB Photos',
          val: null
        }
        const photosSize = {
          key: 'Size',
          val: null
        }
        this.categories.push({
          title: 'Storage',
          items: [photoFiles, photoEntries, photosSize]
        })
        PhotoService.getPhotoCount().then(c => photoEntries.val = c)
        PhotoService.getPhotoFileCount().then(c => photoFiles.val = c)
        PhotoService.getPhotosSize().then(size => photosSize.val = formatBytesFilter(size))
      },
      loadUploads () {
        const files = {key: 'Files', val: null}
        const pending = {key: 'Pending', val: null}
        this.categories.push({
          title: "Uploads",
          items: [
            files,
            pending
          ]
        })
        DatabaseService.getUpdatedRecordsCount().then(c => pending.val = c)
      },
      loadLogs () {
        const totalLogs = {key: 'Logs', val: null}
        const uploaded = {key: 'Uploaded', val: null}
        this.categories.push({
          title: 'Logs',
          items: [
            totalLogs,
            uploaded
          ],
          to: {name: 'Logs'}
        })
        logger.getLogCount().then(c => totalLogs.val = c)
        logger.getUploadedCount().then(c => uploaded.val = c)
      }
    }
  })
</script>

<style lang="sass" scoped>
  /*.card*/
    /*width:*/
</style>
