<template>
  <v-col class="ma-0">
    <v-row class="align-center">
      <MenuSelect
        v-model="value.parameterId"
        :items="parameters"
        :disabled="disabled"
        @change="onChange"
        item-text="name"
        item-value="id"
      />
      <v-col class="ml-2">
        <v-text-field
          v-if="isNumber"
          :readonly="disabled"
          v-model="value.val"
          type="number"
          :label="$t('value')"
          @change="onChange"
          hide-details
        />
        <v-checkbox
          v-else-if="isBoolean"
          :disabled="disabled"
          v-model="value.val"
          hide-details
          @change="onChange"
        />
        <ChoiceSelector
          v-else-if="isChoice"
          :disabled="disabled"
          v-model="value.val"
          @change="onChange"
          :questionChoices="choices"
          itemValue="val"
          hide-details
          :locale="locale"
        />
        <v-text-field
          v-else
          :readonly="disabled"
          v-model="value.val"
          :label="$t('value')"
          hide-details
          @change="onChange"
        />
      </v-col>
      <DotsMenu v-if="!disabled" removable @remove="$emit('delete')" />
    </v-row>
    <v-progress-linear v-if="working" indeterminate />
  </v-col>
</template>

<script lang="ts">
import Parameter, { ParameterType } from '../../entities/trellis/Parameter'
import Vue, { PropType } from 'vue'
import type QuestionParameter from '../../entities/trellis/QuestionParameter'
import MenuSelect from './MenuSelect.vue'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import type Choice from '../../entities/trellis/Choice'
import type GeoType from '../../entities/trellis/GeoType'
import builder from '../../services/builder'
import ChoiceSelector from './ChoiceSelector.vue'
import type Locale from '../../entities/trellis/Locale'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  name: 'ParameterRow',
  components: { MenuSelect, ChoiceSelector, DotsMenu },
  props: {
    value: Object as PropType<QuestionParameter>,
    parameters: Array as PropType<Parameter[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    locale: Object as PropType<Locale>,
    choices: Array as PropType<Choice[]>,
    geoTypes: Array as PropType<GeoType[]>,
    disabled: Boolean,
  },
  data() {
    return {
      working: false
    }
  },
  methods: {
    async onChange() {
      if (this.working) return
      this.working = true
      try {
        const updated = await builder.createOrUpdateParameter({
          id: this.value.id,
          question_id: this.value.questionId,
          name: this.parameter?.name,
          val: this.value.val,
        })
        this.$emit('input', updated)
        this.$emit('save', updated)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
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