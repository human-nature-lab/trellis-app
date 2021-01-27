<template>
  <tr>
    <td class="actions">
      <v-btn
        icon
        v-if="showHistory"
        @click="$emit('input', !value)">
        <v-icon v-if="value">mdi-arrow-down</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </v-btn>
    </td>
    <td>
      <GeoBreadcrumbs
        v-if="respondentGeo.geoId"
        :geo-id="respondentGeo.geoId" />
      <span v-else>
        {{$t('unknown_location')}}
      </span>
    </td>
    <td>
      <span v-if="respondentGeo.geo">
        {{respondentGeo.geo.geoType.name}}
      </span>
      <span v-else>
        {{$t('unknown_location')}}
      </span>
    </td>
    <td>
      <v-btn
        icon
        color="primary"
        @click="$emit('overrideCurrent')"
        v-if="canChangeIsCurrent" >
        <v-icon v-if="respondentGeo.isCurrent">mdi-check</v-icon>
      </v-btn>
      <v-icon v-else-if="respondentGeo.isCurrent">mdi-check</v-icon>
    </td>
    <td
      class="actions flex flex-nowrap"
      v-show="showControls">
      <v-tooltip
        bottom
        v-if="!respondentGeo.isCurrent">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-on="on"
            v-bind="attrs"
            icon
            @click="$emit('remove', respondentGeo.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('remove_location') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-on="on"
            v-bind="attrs"
            icon
            @click="$emit('move', respondentGeo)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('move_respondent_location') }}</span>
      </v-tooltip>
    </td>
  </tr>
</template>

<script>
  import { TrellisPermission } from '../../static/permissions.base'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import Permission from '../Permission'
  import PermissionMixin from '../../mixins/PermissionMixin'
  export default {
    name: 'RespondentGeoRow',
    components: {Permission, GeoBreadcrumbs},
    mixins: [PermissionMixin],
    props: {
      showControls: {
        type: Boolean,
        default: false
      },
      showHistory: {
        type: Boolean,
        default: false
      },
      value: {
        type: Boolean,
        default: false
      },
      respondentGeo: {
        type: Object,
        required: true
      }
    },
    computed: {
      canChangeIsCurrent () {
        return this.hasPermission(TrellisPermission.CHANGE_RESPONDENT_GEO_CURRENT)
      }
    }
  }
</script>

<style lang="sass">
  td, th
    &.actions
      padding: 0 !important
</style>
