<template>
  <v-row no-gutters class="align-center">
    <v-col md="auto" cols="12" class="px-1">
      <MenuSelect
        v-model="value.showHide"
        :items="showOpts"
        :disabled="disabled"
        color="primary lighten-3"
      />
      <span class="mx-1">the page if the respondent has</span>
      <MenuSelect
        v-model="value.anyAll"
        :items="anyOpts"
        :disabled="disabled"
        color="primary lighten-3"
      />
      <span class="mx-1">of the conditions</span>
      <span v-if="disabled">
        <v-chip
          color="primary lighten-3"
          v-for="condition in selectedConditionTags"
          :key="condition"
          label
        >{{ condition }}</v-chip>
      </span>
    </v-col>
    <v-col cols="auto" class="flex-grow-1" v-if="!disabled">
      <v-autocomplete
        :value="selectedConditionTags"
        @change="updateConditionTags"
        :items="conditionTagNames"
        multiple
        dense
        single-line
        chips
        color="primary lighten-3"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Skip from '../../entities/trellis/Skip'
import Vue, { PropType } from 'vue'
import titleCase from '../../filters/TitleCase'
import MenuSelect from './MenuSelect.vue';
import ConditionTag from '../../entities/trellis/ConditionTag';

export default Vue.extend({
  name: 'SkipRow',
  components: { MenuSelect },
  filters: { titleCase },
  props: {
    value: Object as PropType<Skip>,
    disabled: Boolean,
    conditionTags: Array as PropType<ConditionTag[]>,
  },
  computed: {
    selectedConditionTags(): string[] {
      const r = this.value.conditionTags.map((sct) => sct.conditionTagName)
      r.sort()
      return r
    },
    conditionTagNames(): string[] {
      const r = this.conditionTags.map(c => c.name)
      r.sort()
      return r
    },
    showOpts(): object[] {
      return [{
        text: this.$t('show'),
        value: true,
      }, {
        text: this.$t('hide'),
        value: false,
      }]
    },
    anyOpts(): object {
      return [{
        text: this.$t('any'),
        value: false,
      }, {
        text: this.$t('all'),
        value: true,
      }]
    }
  },
  methods: {
    updateConditionTags(newConds: string[]) {
      console.log('updateConditionTags', newConds)
      this.$emit('change', newConds)
    }
  }
})
</script>

<style lang="sass">

</style>