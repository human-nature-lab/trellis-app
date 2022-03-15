<template>
  <v-row no-gutters class="align-end">
    <v-col v-if="!disabled" cols="1">
      <DotsMenu removable @remove="$emit('remove')" :loading="loading" />
    </v-col>
    <v-col md="auto" cols="11" class="px-1">
      <MenuSelect
        v-model="value.showHide"
        :items="showOpts"
        :disabled="disabled || loading"
        @change="updateShowHide"
        color="primary lighten-3"
      />
      <span class="mx-1">the page if the respondent has</span>
      <MenuSelect
        v-model="value.anyAll"
        :items="anyOpts"
        :disabled="disabled || loading"
        @change="updateAnyAll"
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
        :disabled="loading"
        multiple
        dense
        hide-details
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
import DotsMenu from './DotsMenu.vue';

export default Vue.extend({
  name: 'SkipRow',
  components: { MenuSelect, DotsMenu },
  filters: { titleCase },
  props: {
    value: Object as PropType<Skip>,
    disabled: Boolean,
    loading: Boolean,
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
      this.$emit('changeConditions', this.value, newConds)
    },
    updateShowHide (val: boolean) {
      this.value.showHide = val
      this.$emit('change', this.value)
    },
    updateAnyAll (val: boolean) {
      this.value.anyAll = val
      this.$emit('change', this.value)
    },
  }
})
</script>

<style lang="sass">

</style>