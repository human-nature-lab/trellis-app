<template>
  <tr>
    <td class="actions">
      <v-btn
        icon
        v-if="showHistory"
        @click="$emit('input', !value)">
        <v-icon v-if="value">keyboard_arrow_down</v-icon>
        <v-icon v-else>chevron_right</v-icon>
      </v-btn>
    </td>
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
    <td
      class="actions"
      v-show="showControls">
      <v-tooltip
        bottom
        v-if="!respondentGeo.isCurrent">
        <v-btn
          slot="activator"
          icon
          @click="$emit('remove', respondentGeo.id)">
          <v-icon>delete</v-icon>
        </v-btn>
        <span>{{ $t('remove_location') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <v-btn
          icon
          slot="activator"
          @click="$emit('move', respondentGeo)">
          <v-icon>edit</v-icon>
        </v-btn>
        <span>{{ $t('move_respondent_location') }}</span>
      </v-tooltip>
    </td>
  </tr>
</template>

<script>
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import Permission from '../Permission'
  export default {
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
    name: 'RespondentGeoRow',
    components: {Permission, GeoBreadcrumbs}
  }
</script>

<style lang="sass">
  td, th
    &.actions
      padding: 0 !important
</style>
