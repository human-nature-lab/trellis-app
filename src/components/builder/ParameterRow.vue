<template>
  <v-row class="align-center">
    <MenuSelect
      v-model="value.parameterId"
      :items="parameters"
      :disabled="disabled"
      :loading="working"
      @change="onChange"
      item-text="name"
      item-value="id"
    />
    <v-col class="ml-2">
      <v-text-field
        v-if="isNumber"
        :readonly="disabled"
        v-model="value.val"
        :loading="working"
        type="number"
        :label="$t('value')"
        @change="onChange"
      />
      <v-checkbox
        v-else-if="isBoolean"
        :disabled="disabled"
        :loading="working"
        v-model="value.val"
        @change="onChange"
      />
      <ChoiceSelector
        v-else-if="isChoice"
        :loading="working"
        :disabled="disabled"
        v-model="value.val"
        :questionChoices="choices"
        itemValue="val"
        :locale="locale"
      />
      <v-text-field
        v-else
        :readonly="disabled"
        v-model="value.val"
        :loading="working"
        :label="$t('value')"
        @change="onChange"
      />
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
import type QuestionParameter from '../../entities/trellis/QuestionParameter'
import MenuSelect from './MenuSelect.vue'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import type Choice from '../../entities/trellis/Choice'
import type GeoType from '../../entities/trellis/GeoType'
import builder from '../../services/builder'
import ChoiceSelector from './ChoiceSelector.vue'
import type Locale from '../../entities/trellis/Locale'

export default Vue.extend({
  name: 'ParameterRow',
  components: { MenuSelect, ChoiceSelector },
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
      this.working = true
      try {
        const payload = {
          id: this.value.id,
          question_id: this.value.questionId,
          name: this.parameter?.name,
          val: this.value.val,
        }
        const updated = await builder.createOrUpdateParameter(payload)
        this.$emit('input', updated)
        this.$emit('save', updated)
      } catch (err) {

      } finally {
        this.working = false
      }
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