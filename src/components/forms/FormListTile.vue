<template>
  <tr>
    <td class="small">
      <v-menu offset-x v-model="showMenu">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item-action v-on="on" v-bind="attrs">
            <v-btn
              :disabled="isBusy"
              @click.stop.prevent="showMenu = !showMenu"
              icon
            >
              <TrellisLoadingCircle
                v-if="isBusy"
                size="100%"
              ></TrellisLoadingCircle>
              <v-icon v-else>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
        <v-list>
          <Permission :requires="TrellisPermission.EDIT_FORM">
            <v-list-item
              :to="{
                name: 'FormBuilder',
                params: { formId: form.id, mode: 'builder' },
              }"
            >
              <v-list-item-content> Edit </v-list-item-content>
            </v-list-item>
          </Permission>
          <v-list-item
            :to="{ name: 'InterviewPreview', params: { formId: form.id } }"
          >
            <v-list-item-content> Preview </v-list-item-content>
          </v-list-item>
          <!--v-list-item :to="{name: 'FormBuilder', params: {formId: form.id, mode: 'print'}}">
              <v-list-item-content>
                Print
              </v-list-item-content>
            </v-list-item-->
          <v-list-item @click="exportForm">
            <v-list-item-content> Export </v-list-item-content>
          </v-list-item>
          <Permission :requires="TrellisPermission.REMOVE_FORM">
            <v-list-item @click="$emit('delete')">
              <v-list-item-content>
                <span color="error">Delete</span>
              </v-list-item-content>
            </v-list-item>
          </Permission>
        </v-list>
      </v-menu>
    </td>
    <td>
      <TranslationTextField
        :translation="memForm.nameTranslation"
        @click.stop.prevent
      ></TranslationTextField>
    </td>
    <td v-if="formType === formTypes.CENSUS" style="min-width: 20em">
      <v-select
        :items="censusTypes"
        v-model="studyForm.censusTypeId"
        @change="changeCensusType"
        box
        hide-details
        label="Census type"
      ></v-select>
    </td>
    <td>
      <v-checkbox v-model="memForm.isPublished" @change="save"></v-checkbox>
    </td>
    <td>
      <v-btn icon @click="$emit('input', !value)">
        <v-icon v-if="value">mdi-chevron-up</v-icon>
        <v-icon v-else>mdi-chevron-down</v-icon>
      </v-btn>
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from "vue";
  import Form from "../../entities/trellis/Form";
  // @ts-ignore
  import AsyncTranslationText from "../AsyncTranslationText";
  import Permission from "../Permission";
  // @ts-ignore
  import TranslationTextField from "../TranslationTextField";
  // @ts-ignore
  import TrellisLoadingCircle from "../TrellisLoadingCircle";
  import FormService from "../../services/form/FormService";
  import debounce from "lodash/debounce";
  import formTypes from "../../static/form.types";
  import censusTypes from "../../static/census.types";
  import StudyForm from "../../entities/trellis/StudyForm";

  export default Vue.extend({
    name: "form-list-tile",
    components: {
      AsyncTranslationText,
      TranslationTextField,
      TrellisLoadingCircle,
      Permission,
    },
    data() {
      return {
        isBusy: false,
        formTypes,
        showMenu: false,
        isOpen: false,
        memForm: this.form.copy(),
        saveThrottled: debounce(async () => {
          this.$emit("save", this.memForm);
        }, 2000),
      };
    },
    props: {
      form: Object as () => Form,
      studyForm: Object as () => StudyForm,
      formType: String,
      value: {
        type: Boolean,
      },
    },
    watch: {
      form(newForm: Form) {
        this.memForm = newForm.copy();
      },
    },
    computed: {
      censusTypes() {
        let returnTypes = [];
        for (let censusType in censusTypes) {
          returnTypes.push({
            text: this.$t(censusType),
            value: censusTypes[censusType],
          });
        }
        return returnTypes;
      },
    },
    methods: {
      idFrom(key: string): string {
        return key + "-" + this.form.id;
      },
      printForm() {},
      async exportForm() {
        this.isBusy = true;
        try {
          await FormService.exportForm(this.form.id);
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, "Unable to export form");
          }
        } finally {
          this.isBusy = false;
        }
      },
      save() {
        this.$emit("save", this.memForm);
      },
      changeCensusType(censusTypeId) {
        let sf = this.studyForm.copy();
        sf.censusTypeId = censusTypeId;
        this.$emit("updateStudyForm", sf);
      },
    },
  });
</script>

<style lang="sass">
.small
  width: 20px
</style>
