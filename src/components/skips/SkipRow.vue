<template>
  <v-row wrap class="align-center">
    <v-col cols="11">
      <v-row wrap class="align-center">
        <v-col cols="12" md="2">
          <v-select
            dense
            solo
            single-line
            hide-details
            :disabled="disabled"
            v-model="memSkip.showHide"
            :items="skipTypes"
          />
        </v-col>
        <v-col cols="12" md="2"> this {{ subject }} if {{ scope }} has </v-col>
        <v-col cols="12" md="3">
          <v-select
            dense
            solo
            single-line
            hide-details
            :disabled="disabled"
            v-model="memSkip.anyAll"
            :items="logicTypes"
          />
        </v-col>
        <v-col cols="12" md="2"> of these conditions: </v-col>
        <v-col cols="12" md="3">
          <TrellisLoadingCircle v-if="isLoading" />
          <v-autocomplete
            dense
            deletable-chips
            chips
            solo
            single-line
            hide-details
            multiple
            :disabled="disabled"
            v-show="!isLoading"
            :items="existingConditionTagNames"
            append-icon="mdi-plus"
            @click:append="showCreateConditionTag"
            :value="selectedConditionTags"
            @input="updateConditionTags"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="1" class="align-center justify-center h-full">
      <v-row>
        <v-btn
          icon
          :disabled="isDirty || disabled"
          @click="remove()"
          :loading="isDirty"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-row>
    </v-col>
    <TrellisModal title="New condition tag" v-model="showConditionTag">
      <v-text-field
        label="Condition tag"
        v-model="conditionTagName"
        append-icon="mdi-plus"
        @click:append="addConditionTag"
      />
    </TrellisModal>
  </v-row>
</template>

<script lang="ts">
  import Vue from "vue";
  import Skip from "../../entities/trellis/Skip";
  import ConditionTag from "../../entities/trellis/ConditionTag";
  import TrellisLoadingCircle from "../TrellisLoadingCircle";
  import TrellisModal from "../TrellisModal";
  import debounce from "lodash/debounce";
  import SkipConditionTag from "../../entities/trellis/SkipConditionTag";
  import CompareService from "../../services/CompareService";

  export default Vue.extend({
    name: "SkipRow",
    components: { TrellisLoadingCircle, TrellisModal },
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
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        memSkip: this.skip.copy(),
        isDirty: false,
        showConditionTag: false,
        conditionTagName: null,
        skipTypes: [
          {
            text: "Show",
            value: true,
          },
          {
            text: "Hide",
            value: false,
          },
        ],
        logicTypes: [
          {
            text: "any",
            value: true,
          },
          {
            text: "all",
            value: false,
          },
        ],
        saveThrottled: null,
      };
    },
    created() {
      this.saveThrottled = debounce(() => {
        console.log("emitting finalSave event");
        this.$emit("save", this.memSkip);
      }, 2000);
    },
    watch: {
      skip(newSkip) {
        console.log("Updating skip", newSkip);
        this.merge(newSkip);
        this.isDirty = false;
      },
      memSkip: {
        handler(newSkip): void {
          console.log("modified memory copy of skip", newSkip);
          if (
            !CompareService.entitiesAreEqual(newSkip, this.skip) &&
            newSkip.conditionTags.length
          ) {
            console.log("mem copy is different from previous");
            this.isDirty = true;
            this.saveThrottled(newSkip);
          } else {
            this.isDirty = false;
          }
        },
        deep: true,
      },
    },
    computed: {
      selectedConditionTags(): string[] {
        return this.memSkip.conditionTags.map((sct) => sct.conditionTagName);
      },
      isLoading(): boolean {
        return Array.isArray(this.conditionTags) && !this.conditionTags.length;
      },
      existingConditionTagNames(): string[] {
        return this.conditionTags
          .map((ct) => ct.name)
          .concat(this.selectedConditionTags);
      },
    },
    methods: {
      merge(newSkip: Skip) {
        this.memSkip = newSkip.copy();
      },
      showCreateConditionTag() {
        this.showConditionTag = true;
        this.conditionTagName = "";
      },
      updateConditionTags(tags: string[]) {
        console.log("updating condition tags");
        if (tags.length > this.memSkip.conditionTags.length) {
          // Adding condition tags
          for (let name of tags) {
            if (this.selectedConditionTags.indexOf(name) === -1) {
              this.memSkip.conditionTags.push(
                new SkipConditionTag().fromSnakeJSON({
                  condition_tag_name: name,
                })
              );
            }
          }
        } else {
          // Removing condition tags
          for (let i = 0; i < this.memSkip.conditionTags.length; i++) {
            const tag = this.memSkip.conditionTags[i];
            if (tags.indexOf(tag.conditionTagName) === -1) {
              this.memSkip.conditionTags.splice(i, 1);
              i++;
            }
          }
        }
      },
      addConditionTag() {
        this.memSkip.conditionTags.push(
          new SkipConditionTag().fromSnakeJSON({
            condition_tag_name: this.conditionTagName,
          })
        );
        this.showConditionTag = false;
      },
      remove() {
        this.$emit("remove");
      },
    },
  });
</script>

<style lang="sass" scoped>
.h-full
  height: 100%
</style>