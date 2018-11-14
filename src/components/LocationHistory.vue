<template>
  <v-container>
    <v-layout>
      <v-flex>
        <h1>Location History</h1>
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex>
        <v-progress-circular v-if="isWatching" indeterminate/>
        <v-btn v-else @click="tryWatch">Retry</v-btn>
      </v-flex>
    </v-layout>
    <v-data-table
      :pagination.sync="pagination"
      :headers="headers"
      :items="items">
      <tr slot="items" slot-scope="props">
        <td v-for="h in headers" :style="{borderColor: props.item.color}">{{props.item[h.value]}}</td>
      </tr>
    </v-data-table>
  </v-container>
</template>

<script>
  import GeoLocationService from '../services/geolocation'
  import {interpolateHeatmap} from '../classes/M'

  export default {
    name: 'LocationHistory',
    data () {
      return {
        geolocation: GeoLocationService,
        pagination: {
          sortBy: 'timestamp',
          descending: true
        },
        now: Date.now(),
        headers: ['timestamp', 'diff', 'latitude', 'longitude', 'altitude', 'accuracy', 'heading', 'speed'].map(n => ({
          text: n[0].toUpperCase() + n.slice(1),
          value: n
        }))
      }
    },
    methods: {
      tryWatch () {
        GeoLocationService.watchPosition()
      }
    },
    computed: {
      items () {
        return this.geolocation.positionHistory.map(p => ({
          timestamp: p.timestamp,
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          altitude: p.coords.altitude,
          accuracy: p.coords.accuracy,
          heading: p.coords.heading,
          speed: p.coords.speed,
          diff: Date.now() - p.timestamp,
          color: interpolateHeatmap(Date.now() - p.timestamp, [0, 5 * 60 * 1000], ['00ff00', 'ff0000'])
        }))
      },
      isWatching () {
        return this.geolocation.watchId !== null
      }
    }
  }
</script>

<style scoped>

</style>
