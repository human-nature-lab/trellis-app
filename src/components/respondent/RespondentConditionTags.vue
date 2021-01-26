<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('condition_tags') }}
      </v-toolbar-title>
      <v-spacer />
      <Permission :requires="TrellisPermission.ADD_RESPONDENT_CONDITION_TAG">
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              icon
              class="mb-2"
              @click="showForm = true">
              <v-icon>add</v-icon>
            </v-btn>
          </template>
          <span>{{$t('add_condition_tag')}}</span>
        </v-tooltip>
      </Permission>
    </v-toolbar>
    <v-data-table
      class="mb-3"
      hide-default-footer
      :headers="conditionTagHeaders"
      :items="conditionTags">
      <template v-slot:item="{ item }">
        <td>{{ item.conditionTag.name }}</td>
        <td class="text-xs-right">{{ item.createdAt.format('l') }}</td>
        <Permission :requires="TrellisPermission.REMOVE_RESPONDENT_CONDITION_TAG">
          <td>
            <v-btn
              icon
              @click="deleteRespondentConditionTag(item.id)">
              <v-progress-circular
                v-if="isDeleting(item.id)"
                indeterminate />
              <v-icon v-else>delete</v-icon>
            </v-btn>
          </td>
        </Permission>
      </template>
    </v-data-table>
    <RespondentConditionTagForm
      v-model="showForm"
      :respondentId="respondent.id"
      :conditionTag="editingConditionTag"
      @close="doneAddingRespondentConditionTag" />
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Permission from '../Permission'
  // @ts-ignore
  import RespondentConditionTagForm from './RespondentConditionTagForm'
  import Vue from 'vue'

  import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
  import ConditionTagService from '../../services/condition-tag'

  export default Vue.extend({
    components: {
      Permission,
      RespondentConditionTagForm
    },
    data () {
      return {
        showForm: false,
        editingConditionTag: null,
        error: null,
        deleting: {},
        conditionTagHeaders: [{
          text: 'Tag name',
          value: 'name',
          class: 'main-column',
          sortable: false
        }, {
          text: 'Date added',
          value: 'createdAt',
          width: '15%',
          sortable: false
        }, {
          text: '',
          value: 'remove',
          width: '10%',
          sortable: false
        }],
      }
    },
    props: {
      respondent: {
        type: Object,
        required: true
      },
      conditionTags: {
        type: Array,
        default: [] as RespondentConditionTag[]
      }
    },
    created () {
      // TODO: Load respondent condition tags if they aren't passed in
    },
    name: 'RespondentConditionTags',
    methods: {
      doneAddingRespondentConditionTag (tag: RespondentConditionTag): void {
        this.conditionTags.push(tag)
        this.showForm = false
      },
      async deleteRespondentConditionTag (respondentConditionTagId: string): Promise<void> {
        console.log('deleteRespondentConditionTag', respondentConditionTagId)
        // TODO: Finish UI for removing respondent condition tags
        if (!window.confirm(`Are you sure you want to delete this respondent condition tag?`)) return
        this.deleting[respondentConditionTagId] = true
        try {
          await ConditionTagService.removeRespondentConditionTag(this.respondent.id, respondentConditionTagId)
          let index = this.conditionTags.findIndex((t: RespondentConditionTag) => t.id === respondentConditionTagId)
          this.conditionTags.splice(index, 1)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        } finally {
          this.deleting[respondentConditionTagId] = false
        }
      },
      isDeleting (id: string): boolean {
        return this.deleting[id]
      }
    }
  })
</script>

<style scoped>

</style>
