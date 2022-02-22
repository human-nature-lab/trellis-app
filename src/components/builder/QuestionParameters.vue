<template>
  <v-col>
    <v-row no-gutters>{{ $t('parameters') }}</v-row>
    <v-list>
      <v-list-item v-for="(p, index) in value" :key="p.id">
        <ParameterRow v-model="value[index]" :parameters="parameters" :disabled="disabled" />
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

export default Vue.extend({
  name: "QuestionParameters",
  props: {
    disabled: Boolean,
    value: Array as PropType<QPType[]>,
    parameters: Array as PropType<Parameter[]>,
    questionId: String,
  },
  components: { MenuSelect, ParameterRow },
  methods: {
    onChange() {

    },
  }
})
</script>

<style lang="sass">

</style>