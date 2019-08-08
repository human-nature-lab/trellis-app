<template>
  <v-flex>
    <v-form v-model="isValid" ref="form">
      <v-container>
        <v-layout column>
          <v-flex>
            <v-text-field
              :disabled="isBusy"
              v-model="memGeoType.name"
              :label="$t('name')" />
          </v-flex>
          <v-flex>
            <v-checkbox
              :disabled="isBusy"
              v-model="memGeoType.canUserAdd"
              :label="$t('can_user_create')" />
          </v-flex>
          <v-flex>
            <v-checkbox
              :disabled="isBusy"
              v-model="memGeoType.canUserAddChild"
              :label="$t('can_user_add_child')" />
          </v-flex>
          <v-flex>
            <v-checkbox
              :disabled="isBusy"
              v-model="memGeoType.canContainRespondent"
              :label="$t('can_contain_respondent')" />
          </v-flex>
          <v-flex>
            <v-layout>
              <v-spacer />
              <v-btn
                @click="resetMemcopy(geoType)"
                :disabled="isBusy">
                {{$t('clear')}}
              </v-btn>
              <v-btn
                @click="save"
                :disabled="isBusy || !isValid">
                <TrellisLoadingCircle v-if="isBusy" size="30px" />
                <span v-else>{{$t('save')}}</span>
              </v-btn>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoType from '../../entities/trellis/GeoType'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  export default Vue.extend({
    name: 'GeoTypeForm',
    components: { TrellisLoadingCircle },
    props: {
      geoType: Object as () => GeoType,
      isBusy: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        isValid: false,
        memGeoType: null as GeoType
      }
    },
    created () {
      this.resetMemcopy(this.geoType)
    },
    watch: {
      geoType (newVal) {
        this.resetMemcopy(newVal)
      }
    },
    methods: {
      resetMemcopy (newGeoType: GeoType) {
        if (newGeoType) {
          this.memGeoType = newGeoType.copy()
        } else {
          const gt = new GeoType()
          gt.name = ''
          gt.canUserAdd = false
          gt.canUserAddChild = false
          gt.canContainRespondent = false
          this.$set(this, 'memGeoType', gt)
        }
      },
      save () {
        if (this.isValid) {
          this.$emit('save', this.memGeoType)
        }
      }
    }
  })
</script>
