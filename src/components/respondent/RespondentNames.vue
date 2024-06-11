<script lang="ts" setup>
import { ref } from 'vue'
import { TrellisPermission } from '@/static/permissions.base'
import Permission from '../Permission.vue'
import RespondentNameForm from './RespondentNameForm.vue'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentService from '../../services/respondent'
import Respondent from '@/entities/trellis/Respondent'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError, alert } from '@/helpers/log.helper'

const props = defineProps<{
  respondent: Respondent
}>()

const emit = defineEmits<{
  (event: 'update:respondent-names', value: RespondentName[]): void
}>()

const isEditing = ref(false)
const isAdding = ref(false)
const deleting = ref({} as Record<string, boolean>)
const currentName = ref(null)
const nameHeaders = ref([{
  text: 'Name',
  value: 'name',
  class: 'main-column',
}, {
  text: 'Current',
  value: 'isCurrent',
}, {
  text: '',
  value: 'actions',
  class: 'actions',
}])

async function removeName (nameId: string): Promise<void> {
  const name = props.respondent.names.find(name => name.id === nameId)
  if (name && name.isDisplayName) {
    alert('error', 'Cannot delete the display name for a respondent')
    return
  }
  if (!name || !confirm(`Are you sure you want to delete the name "${name.name}"?`)) {
    return
  }
  deleting.value[nameId] = true
  try {
    await RespondentService.removeName(props.respondent.id, nameId)
    const index = props.respondent.names.findIndex(name => name.id === nameId)
    const names = props.respondent.names.slice()
    names.splice(index, 1)
    emit('update:respondent-names', names)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, `Failed to delete the respondent name -> ${name.name}`)
    }
  } finally {
    deleting.value[nameId] = false
    deleting.value = Object.assign({}, deleting.value)
  }
}

function doneAddingName (name: RespondentName): void {
  if (name) {
    if (name.isDisplayName) {
      props.respondent.names.forEach(name => {
        name.isDisplayName = false
      })
    }
    const names = props.respondent.names.slice()
    names.push(name)
    emit('update:respondent-names', names)
  }
  isAdding.value = false
}

function doneEditingName (name: RespondentName): void {
  const oldIndex = props.respondent.names.findIndex(n => name.previousRespondentNameId === n.id)
  const names = props.respondent.names.slice()
  names.splice(oldIndex, 1, name)
  emit('update:respondent-names', names)
  isEditing.value = false
}

</script>

<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('names') }}
      </v-toolbar-title>
      <v-spacer />
      <Permission :requires="TrellisPermission.ADD_RESPONDENT_NAME">
        <v-tooltip left>
          <template #activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              icon
              @click="isAdding = true"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('add_respondent_name') }}</span>
        </v-tooltip>
      </Permission>
    </v-toolbar>
    <v-data-table
      class="mb-4"
      :headers="nameHeaders"
      :items="respondent.names"
      :items-per-page="-1"
      hide-default-footer
    >
      <template #item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>
            <v-icon v-if="props.item.isDisplayName">
              mdi-check
            </v-icon>
          </td>
          <td class="actions">
            <Permission :requires="TrellisPermission.EDIT_RESPONDENT_NAME">
              <v-btn
                icon
                @click="currentName = props.item; isEditing = true"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </Permission>
            <Permission :requires="TrellisPermission.REMOVE_RESPONDENT_NAME">
              <v-btn
                icon
                @click="removeName(props.item.id)"
              >
                <v-progress-circular
                  v-if="deleting[props.item.id]"
                  indeterminate
                />
                <v-icon v-else>
                  mdi-delete
                </v-icon>
              </v-btn>
            </Permission>
          </td>
        </tr>
      </template>
    </v-data-table>
    <RespondentNameForm
      v-model="isAdding"
      :respondent="respondent"
      @close="doneAddingName"
    />
    <RespondentNameForm
      v-if="currentName !== null"
      v-model="isEditing"
      :name="currentName"
      :respondent="respondent"
      @close="doneEditingName"
    />
  </v-flex>
</template>