<template>
  <tr class="form-list-row">
    <td class="medium drag-handle" v-if="Number(formType) !== formTypes.CENSUS" >
      <span v-show="dragging" class="text-button">{{ studyForm.sortOrder }}</span>
      <span class="ml-2"><v-icon>mdi-drag-horizontal-variant</v-icon></span>
    </td>
    <td class="small">
      <v-menu offset-y right v-model="showMenu">
        <template #activator="{ on, attrs }">
          <v-list-item-action v-on="on" v-bind="attrs">
            <v-btn
              :disabled="isBusy"
              @click.stop.prevent="showMenu = !showMenu"
              icon
            >
              <v-progress-circular v-if="isBusy" indeterminate />
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
          <Permission :requires="TrellisPermission.EDIT_FORM">
            <v-list-item @click="$emit('toggleFormSkips', studyForm.form)">
              <v-list-item-content>
                {{ $t('edit_skips') }}
              </v-list-item-content>
            </v-list-item>
          </Permission>
          <Permission :requires="TrellisPermission.EDIT_FORM">
            <v-list-item @click="publishForm">
              <v-list-item-content>
                {{ $t('publish_form') }}
              </v-list-item-content>
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
                <span color="error--text">Delete</span>
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
    <td v-if="Number(formType) === formTypes.CENSUS" style="min-width: 20em">
      <v-select
        :items="censusTypes"
        v-model="studyForm.censusTypeId"
        @change="changeCensusType"
        hide-detail />
    </td>
    <td>
      <v-select
        v-model="version"
        :items="form.versions"
        item-text="version"
        item-value="id">
        <template #item="{ item }">
          v{{ item.version }}
          <span v-if="item.id === form.studyForm.currentVersionId">(published)</span>
        </template>
      </v-select>
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
        version: this.studyForm.currentVersionId,
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
      dragging: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      form(newForm: Form) {
        this.memForm = newForm.copy();
        this.version = this.studyForm.currentVersionId
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
      }
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
      async publishForm () {
        if (!this.version) {
          return alert('Select a version to publish')
        } else if (this.studyForm.currentVersionId && 
          this.studyForm.currentVersionId !== this.version && 
          !confirm('You are attempting to publish an old version. Is this desired?')) {
          return
        }
        this.isBusy = true
        try {
          const res = await FormService.publishForm(this.studyForm.studyId, this.version)
          console.log(res)
        } finally {
          this.isBusy = false
        }
      },
      save() {
        this.$emit("save", this.memForm);
      },
      changeSortOrder (sortOrder) {
        let sf = this.studyForm.copy();
        sf.sortOrder = sortOrder;
        this.$emit("updateStudyForm", sf);
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
.medium
  width: 80px
.drag-handle
  cursor: grab
</style>
