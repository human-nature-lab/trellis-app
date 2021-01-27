<template>
  <v-autocomplete
    :items="conditionTags"
    :value="value"
    @input="$emit('input', $event)"
    :label="$t('condition_tags')"
    single-line
    multiple
    dense
    chips
    tags
    :hide-no-data="!hasLoaded"
    :search-input.sync="query"
    :loading="isLoading"
  >
    <template #selection="props">
      <v-chip outlined color="primary">
        <v-avatar>
          <v-icon>mdi-label</v-icon>
        </v-avatar>
        {{ props.item }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
  import Vue from "vue";
  import ConditionTagService from "../services/condition-tag";

  export default Vue.extend({
    name: "ConditionTagAutocomplete",
    props: {
      value: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        isLoading: false,
        conditionTags: [],
        hasLoaded: false,
        query: null,
      };
    },
    created() {
      this.loadIfNecessary();
    },
    watch: {
      value() {
        this.loadIfNecessary();
      },
      query(val: string) {
        this.loadConditionTags();
      },
    },
    methods: {
      loadIfNecessary() {
        if (this.value && this.value.length) {
          this.loadConditionTags();
        }
      },
      async loadConditionTags() {
        if (this.conditionTags.length || this.isLoading || this.hasLoaded) return;
        this.isLoading = true;
        try {
          const tags = await ConditionTagService.respondent();
          this.conditionTags = tags.map((c) => c.name);
          this.hasLoaded = true;
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err);
          }
        } finally {
          this.isLoading = false;
        }
      },
    },
  });
</script>

<style lang="sass">
</style>