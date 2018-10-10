<template>
  <tr>
    <td>
      <GeoBreadcrumbs
        :geo-id="respondentGeo.geoId" />
    </td>
    <td>
      {{respondentGeo.geo.geoType.name}}
    </td>
    <td>
      <v-icon v-if="respondentGeo.isCurrent">check</v-icon>
    </td>
    <td>
      <permission :role-whitelist="['admin', 'manager']">
        <v-tooltip v-if="!respondentGeo.isCurrent">
          <v-btn
            slot="activator"
            icon
            @click="remove(respondentGeo.id)">
            <v-icon>delete</v-icon>
          </v-btn>
          <span>{{ $t('remove_location') }}</span>
        </v-tooltip>
        <v-tooltip>
          <v-btn
            v-if="respondentGeo.isCurrent"
            icon
            slot="activator"
            @click="startMove(respondentGeo)">
            <v-icon>edit</v-icon>
          </v-btn>
          <span>{{ $t('move_respondent_location') }}</span>
        </v-tooltip>
      </permission>
    </td>
  </tr>
</template>

<script>
  import {randomInt} from '../../classes/M'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import Permission from '../Permission'
  export default {
    props: {
      respondentGeo: {
        type: Object,
        required: true
      }
    },
    name: 'RespondentGeoRow',
    components: {Permission, GeoBreadcrumbs},
    created () {
      setInterval(() => {
        this.$emit('toggleHistory')
      }, randomInt(0, 10000))
    }
  }
</script>

<style scoped>

</style>
