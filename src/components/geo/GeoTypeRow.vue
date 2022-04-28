<template>
  <tr>
    <td>
      <CRUDMenu
        :editable="hasPermission(TrellisPermission.EDIT_GEO_TYPE)"
        :removable="hasPermission(TrellisPermission.REMOVE_GEO_TYPE)"
        @edit="$emit('edit')"
        @remove="$emit('remove')" />
    </td>
    <td>{{geoType.name}}</td>
    <td class="center">
      <v-icon
        v-if="geoType.canUserAdd"
        color="primary">
        mdi-check
      </v-icon>
    </td>
    <td class="center">
      <v-icon
        v-if="geoType.canUserAddChild"
        color="primary">
        mdi-check
      </v-icon>
    </td>
    <td class="center">
      <v-icon
        v-if="geoType.canContainRespondent"
        color="primary">
        mdi-check
      </v-icon>
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoType from '../../entities/trellis/GeoType'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import CRUDMenu from '../CRUDMenu.vue'
  export default Vue.extend({
    name: 'GeoTypeRow',
    mixins: [PermissionMixin],
    components: { CRUDMenu },
    props: {
      geoType: {
        type: Object as () => GeoType,
        required: true
      }
    }
  })
</script>

<style lang="sass" scoped>
  .center
    text-align: center
</style>
