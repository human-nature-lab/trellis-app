<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <h4>{{ $t('parameters') }}</h4>
      <v-spacer />
      <v-tooltip v-if="!disabled" left>
        <template #activator="{ on, attrs }">
          <v-btn @click="add" text icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_parameter') }}
      </v-tooltip>
    </v-row>
    <v-list v-if="value && value.length">
      <v-list-item v-for="(p, index) in value" :key="p.id">
        <ParameterRow
          v-model="value[index]"
          :parameters="parameters"
          :conditionTags="conditionTags"
          :geoTypes="geoTypes"
          :choices="choices"
          :disabled="disabled"
          @delete="remove"
        />
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import Parameter from '../../entities/trellis/Parameter'
import ParameterRow from './ParameterRow.vue'
import QPType from '../../entities/trellis/QuestionParameter'
import Vue, { PropType } from 'vue'
import MenuSelect from './MenuSelect.vue'
import ConditionTag from '../../entities/trellis/ConditionTag'
import Choice from '../../entities/trellis/Choice'
import GeoType from '../../entities/trellis/GeoType'

export default Vue.extend({
  name: "QuestionParameters",
  props: {
    disabled: Boolean,
    value: Array as PropType<QPType[]>,
    parameters: Array as PropType<Parameter[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    choices: Array as PropType<Choice[]>,
    geoTypes: Array as PropType<GeoType[]>,
    questionId: String,
  },
  components: { MenuSelect, ParameterRow },
  methods: {
    onChange() {

    },
    async add() {

    },
    async remove(p: Parameter) {

    }
  }
})
</script>

<style lang="sass">

</style>