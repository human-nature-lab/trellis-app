<template>
  <tr class="form-list-row">
    <td class="medium drag-handle" v-if="Number(formType) !== formTypes.CENSUS" >
      <span v-show="dragging" class="text-button">{{ studyForm.sortOrder }}</span>
      <span class="ml-2"><v-icon>mdi-drag-horizontal-variant</v-icon></span>
    </td>
    <td class="small">
      <FormActions 
        :isBusy="isBusy" 
        :form="form" 
        :studyForm="studyForm"
        @delete="$emit('delete', $event)"
        @export="exportForm"
        @publish="onPublish"
        @revert="showVersionModal = true"
        @toggleFormSkips="$emit('toggleFormSkips', $event)"
        />
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
        :value="studyForm.currentVersionId"
        :items="form.versions"
        item-text="version"
        item-value="id">
        <template #item="{ item }">
          <v-list-item>
            <v-list-item-icon>
              <v-icon color="success" v-if="!isTestStudy && item.id === studyForm.currentVersionId">
                mdi-check
              </v-icon>
              <v-icon color="info" 
                v-else-if="(isTestStudy && item.id === studyForm.currentVersionId) || (!isTestStudy && !item.isPublished)">
                mdi-dev-to
              </v-icon>
            </v-list-item-icon>
            {{item.version}}
          </v-list-item>
        </template>
      </v-select>
    </td>
    <VersionModal 
      v-model="showVersionModal"
      @update:studyForm="$emit('update:studyForm', $event)"
      :studyForm="studyForm" />
  </tr>
</template>

<script lang="ts">
  import Vue from "vue";
  import Form from "../../entities/trellis/Form";
  // @ts-ignore
  import AsyncTranslationText from "../AsyncTranslationText.vue";
  import Permission from "../Permission.vue";
  // @ts-ignore
  import TranslationTextField from "../TranslationTextField.vue";
  // @ts-ignore
  import TrellisLoadingCircle from "../TrellisLoadingCircle.vue";
  import FormService from "../../services/form/FormService";
  import { debounce } from "lodash";
  import formTypes from "../../static/form.types";
  import censusTypes from "../../static/census.types";
  import StudyForm from "../../entities/trellis/StudyForm";
  import singleton from '../../static/singleton'
  import PermissionMixin from "../../mixins/PermissionMixin";
  import FormActions from './FormActions.vue'
  import VersionModal from './VersionModal.vue'

  export default Vue.extend({
    name: "form-list-tile",
    mixins: [PermissionMixin],
    components: {
      FormActions,
      AsyncTranslationText,
      TranslationTextField,
      TrellisLoadingCircle,
      Permission,
      VersionModal,
    },
    data() {
      return {
        isBusy: false,
        formTypes: formTypes,
        global: singleton,
        showMenu: false,
        showVersionModal: false,
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
      dragging: {
        type: Boolean,
        default: false
      }
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
      async onPublish () {
        if (!confirm(this.$t('confirm_publish'))) {
          return
        }
        try {
          this.loading = true 
          const res = await FormService.publishForm(this.studyForm.studyId, this.form.id)
          this.$emit('input', false)
          this.$emit('update', res)
        } catch (err) {
          this.alert('Unable to publish form', 'error')
        } finally {
          this.loading = false
        }
      },
      save() {
        this.$emit("save", this.memForm);
      },
      changeSortOrder (sortOrder) {
        let sf = this.studyForm.copy();
        sf.sortOrder = sortOrder;
        this.$emit("changeStudyForm", sf);
      },
      changeCensusType(censusTypeId) {
        let sf = this.studyForm.copy();
        sf.censusTypeId = censusTypeId;
        this.$emit("changeStudyForm", sf);
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
