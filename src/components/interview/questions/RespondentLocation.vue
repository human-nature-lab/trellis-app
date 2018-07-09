<template>
    <v-flex class="respondent-location">
      <GeoBreadcrumbs
        v-if="geoId"
        :geo-id="geoId" />
      <span v-else>
        Please select a new location to add to the respondent
      </span>
      <v-btn @click="geoModal = true">
        Add Location
      </v-btn>
      <v-dialog
        v-model="geoModal">
        <GeoSearch @geoSelected="onGeoSelected" />
      </v-dialog>
    </v-flex>
</template>

<script>
  import GeoBreadcrumbs from '../../geo/GeoBreadcrumbs'
  export default {
    name: 'respondent-location',
    components: {GeoBreadcrumbs},
    props: {
      respondent: {
        type: Object,
        required: true
      },
      question: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        geoModal: false
      }
    },
    computed: {
      geoId () {
        let data = this.question.datum.data
        return data.length ? data[0].geo_id : null
      }
    },
    methods: {
      onGeoSelected (geo) {
        console.log(geo)
      }
    }
  }
</script>


