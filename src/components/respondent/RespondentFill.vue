<script lang="ts" setup>
import { ref, watch } from 'vue'
import Respondent from '@/entities/trellis/Respondent'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'

import RespondentFill from '../../entities/trellis/RespondentFill'
import RespondentService from '../../services/respondent'

const props = defineProps<{
  respondent: Respondent
}>()

const respondentFills = ref<RespondentFill[]>()
const fillHeaders = ref([{
  text: 'Name',
  value: 'name',
  width: '50%',
  class: 'main-column',
}, {
  text: 'Value',
  value: 'val',
  align: 'right',
  width: '45%',
}, {
  text: '',
  value: '',
  width: '5%',
  sortable: false,
}])
const loading = ref(false)

async function load () {
  loading.value = true
  try {
    respondentFills.value = await RespondentService.getRespondentFillsById(props.respondent.id)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.respondent, () => {
  load()
}, { immediate: true })

</script>

<template>
  <v-col class="pa-0">
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('respondent_fill_tag') }}
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-data-table
      v-if="respondentFills"
      class="mb-4"
      :headers="fillHeaders"
      :items="respondentFills"
      :items-per-page="-1"
      hide-default-footer
    >
      <template #item="{ item }">
        <tr>
          <td>{{ item.name }}</td>
          <td class="text-xs-right">
            {{ item.val }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-col>
</template>
