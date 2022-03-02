<template>
  <v-row class="align-center">
    <MenuSelect
      v-model="value.parameterId"
      :items="parameters"
      :disabled="disabled"
      item-text="name"
      item-value="id"
    />
    <v-col class="ml-2">
      <v-text-field
        v-if="isText"
        :readonly="disabled"
        v-model="value.val"
        :label="$t('value')"
        @change="onChange"
      />
      <v-text-field
        v-else-if="isNumber"
        :readonly="disabled"
        v-model="value.val"
        type="number"
        :label="$t('value')"
        @change="onChange"
      />
      <v-checkbox
        v-else-if="isBoolean"
        :disabled="disabled"
        v-model="value.val"
        @change="onChange"
      />
      <v-select
        v-else-if="isConditionTag"
        :disabled="disabled"
        v-model="value.val"
        :items="conditionTags"
      />
      <v-select v-else-if="isChoice" :disabled="disabled" v-model="value.val" :items="choices" />
      <v-select v-else-if="isGeoType" :disabled="disabled" v-model="value.val" :items="geoTypes" />
    </v-col>
    <v-menu v-if="!disabled">
      <template #activator="{ attrs, on }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('delete')">
          <v-list-item-action>
            <v-icon color="error">mdi-delete</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ $t('delete') }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-row>
</template>

<script lang="ts">
import Parameter, { ParameterType } from '../../entities/trellis/Parameter'
import Vue, { PropType } from 'vue'
import QuestionParameter from '../../entities/trellis/QuestionParameter'
import MenuSelect from './MenuSelect.vue'
import ConditionTag from '../../entities/trellis/ConditionTag'
import Choice from '../../entities/trellis/Choice'
import GeoType from '../../entities/trellis/GeoType'

export default Vue.extend({
  name: 'ParameterRow',
  components: { MenuSelect },
  props: {
    value: Object as PropType<QuestionParameter>,
    parameters: Array as PropType<Parameter[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    choices: Array as PropType<Choice[]>,
    geoTypes: Array as PropType<GeoType[]>,
    disabled: Boolean,
  },
  methods: {
    onChange() {

    }
  },
  computed: {
    parameter(): Parameter {
      return this.parameters.find(p => p.id === this.value.parameterId)
    },
    isText(): boolean {
      return this.parameter.type === ParameterType.String
    },
    isNumber(): boolean {
      return this.parameter.type === ParameterType.Number
    },
    isChoice(): boolean {
      return this.parameter.type === ParameterType.Choice
    },
    isBoolean(): boolean {
      return this.parameter.type === ParameterType.Boolean
    },
    isGeoType(): boolean {
      return this.parameter.type === ParameterType.GeoType
    },
    isConditionTag(): boolean {
      return this.parameter.type === ParameterType.ConditionTag
    }
  }
})
</script>

<style lang="sass">

</style>