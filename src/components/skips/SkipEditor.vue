<template>
  <v-col>
    <div 
      v-if="conditionTags !== null" 
      v-for="skip in sortedSkips"
      :key="skip.id">
      <SkipRow
        :conditionTags="conditionTags"
        :subject="subject"
        @save="updateSkip"
        @remove="removeSkip(skip)"
        :skip="skip"
      />
    </div>
    <SkipRow
      v-if="showNewSkip && conditionTags !== null"
      :conditionTags="conditionTags"
      :disabled="lockNewSkip"
      @save="storeNewSkip"
      @remove="removeNewSkip"
      :subject="subject"
      :skip="tempSkip"
    />
    <slot name="activator" :on="{ click: addSkip }">
      <v-row no-gutter class="mt-4" v-if="!hideAdd">
        <v-btn @click="addSkip">
          {{ $t("add_skip") }} <v-icon right>mdi-plus</v-icon>
        </v-btn>
      </v-row>
    </slot>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from "vue";
  import Skip from "../../entities/trellis/Skip";
  import SkipRow from "./SkipRow.vue";
  import ConditionTag from "../../entities/trellis/ConditionTag";
  import SkipService from "../../services/skip";
  export default Vue.extend({
    name: "SkipEditor",
    components: { SkipRow },
    props: {
      skips: Array as () => Skip[],
      conditionTags: Array as () => ConditionTag[] | null,
      subject: {
        type: String,
        required: true,
      },
      newSkip: Function as PropOptions<(Skip) => Promise<Skip>>,
      deleteSkip: Function as PropOptions<(Skip) => Promise<any>>,
      hideAdd: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        showNewSkip: false,
        lockNewSkip: false,
        tempSkip: new Skip(),
      };
    },
    methods: {
      addSkip() {
        this.tempSkip = new Skip();
        this.tempSkip.showHide = true;
        this.tempSkip.anyAll = true;
        this.tempSkip.conditionTags = [];
        this.tempSkip.precedence = this.skips.length + 1;
        this.showNewSkip = true;
      },
      async storeNewSkip(newSkip: Skip) {
        try {
          this.lockNewSkip = true;
          await this.newSkip(newSkip);
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err);
          }
        } finally {
          this.lockNewSkip = false;
          this.showNewSkip = false;
        }
      },
      async updateSkip(skip: Skip) {
        try {
          skip = await SkipService.updateSkip(skip);
          this.$emit("update", skip);
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err);
          }
        }
      },
      async removeSkip(skip: Skip) {
        try {
          await this.deleteSkip(skip);
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err);
          }
        }
      },
      async removeNewSkip() {
        this.showNewSkip = false;
      },
    },
    computed: {
      sortedSkips(): Skip[] {
        return this.skips.sort((a, b) => a.precedence - b.precedence);
      },
    },
  });
</script>

<style lang="sass" scoped>
.full-width-col
  min-width: 100%
  .card
    margin: 5px 2px 10px 2px
</style>
