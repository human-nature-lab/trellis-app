<template>
  <p>
    <span class="primary--text">
      {{skip.showHide ? 'Show' : 'Hide'}}
    </span>
    the 
    <span class="primary--text">
      {{subject | titleCase}}
    </span>
    if the 
    <span class="primary--text">
      {{scope | titleCase}}
    </span>
    has
    <span class="primary--text">
      {{skip.anyAll ? 'All' : 'Any'}}
    </span>
    of the conditions
    <v-chip v-for="condition in selectedConditionTags" :key="condition" label>
      {{condition}}
    </v-chip>
  </p>
</template>

<script lang="ts">
  import Vue from "vue";
  import Skip from "../../entities/trellis/Skip";
  import ConditionTag from "../../entities/trellis/ConditionTag";
  import TrellisLoadingCircle from "../TrellisLoadingCircle.vue";
  import TrellisModal from "../TrellisModal.vue";
  import titleCase from '../../filters/TitleCase'

  export default Vue.extend({
    name: "SkipRow",
    components: { TrellisLoadingCircle, TrellisModal },
    filters: { titleCase },
    props: {
      skip: Object as () => Skip,
      conditionTags: Array as () => ConditionTag[],
      scope: {
        type: String,
        default: "respondent",
      },
      subject: {
        type: String,
        required: true,
      }
    },
    computed: {
      selectedConditionTags(): string[] {
        return this.skip.conditionTags.map((sct) => sct.conditionTagName);
      },
      isLoading(): boolean {
        return this.conditionTags === null
      },
    },
  })
</script>
