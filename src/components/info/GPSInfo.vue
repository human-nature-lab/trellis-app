<template>
  <InfoBlock
    title="GPS"
    :items="items"
    :to="{name: 'LocationHistory'}" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import InfoBlock from './InfoBlock.vue'
  import GeoLocationService from '../../services/geolocation'
  import * as moment from 'moment'
  import { VChip } from 'vuetify/lib'

  export default Vue.extend({
    name: "GPSInfo",
    components: { InfoBlock },
    data () {
      return {
        status: {
          key: this.$t('status'),
          component: {
            template: '<v-chip label outlined :class="classes">{{status}}</v-chip>',
            components: { VChip },
            // @ts-ignore
            data: () => this.statusData
          }
        },
        statusData: {
          classes: ['red', 'red--text'],
          status: this.$t('pending')
        },
        lastUpdate: {
          key: this.$t('last_updated'),
          component: {
            template: '<v-chip label outlined :class="classes">{{label}}</v-chip>',
            components: { VChip },
            // @ts-ignore
            data: () => this.updateData
          }
        },
        updateData: {
          classes: ['yellow', 'green--text'],
          label: this.$t('pending')
        },
        gpsInterval_: null
      }
    },
    created () {
      this.gpsInterval_ = setInterval(async () => {
        // TODO: Check that the latest update was at a reasonable time
        const isWorking = await GeoLocationService.hasPositionHistory()
        this.statusData.status = isWorking ? this.$t('working') : this.$t('pending')
        this.statusData.classes = isWorking ? ['green', 'green--text'] : ['red', 'red--text']
        const lastUpdatedPosition = await GeoLocationService.getLatestPosition()
        if (lastUpdatedPosition) {
          const lastUpdated = moment(lastUpdatedPosition.timestamp + 4000)
          const tol = 5 * 60 * 1000
          const withinTol = Date.now() - lastUpdatedPosition.timestamp < tol
          this.updateData.label = lastUpdated.fromNow()
          this.updateData.classes = withinTol ? ['green', 'green--text'] : ['red', 'red--text']
        } else {
          this.updateData.label = this.$t('none')
        }
      }, 2000)
    },
    beforeDestroy () {
      if (this.gpsInterval_) {
        clearInterval(this.gpsInterval_)
      }
    },
    computed: {
      items (): object[] {
        return [this.status, this.lastUpdate]
      }
    }
  })
</script>

<style lang="sass" scoped>

</style>
