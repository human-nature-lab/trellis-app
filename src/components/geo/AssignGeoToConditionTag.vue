<script lang="ts" setup>
import { ref, computed } from 'vue'
import { i18n } from '@/i18n'
import { alertSuccess } from '@/helpers/log.helper'
import ConditionTagAutocomplete from '@/components/ConditionTagAutocomplete.vue'
import ConditionTagService from '@/services/condition-tag'

const props = defineProps<{
  geoId: string
}>()

const emit = defineEmits<{
  (e: 'done'): void
}>()

const conditionTagIds = ref<string[]>([])
const includeChildren = ref(false)
const onlyUseCurrentGeo = ref(false)
const working = ref(false)

async function assignConditionTagsViaGeo () {
  if (!confirm(i18n.t('confirm_assign_conditions') as string)) {
    return
  }
  try {
    working.value = true
    const res = await ConditionTagService.assignTagViaGeos(
      conditionTagIds.value[0],
      includeChildren.value,
      onlyUseCurrentGeo.value,
      [props.geoId],
    )
    alertSuccess(i18n.t('assigned_condition_tags_n', { n: res.respondent_ids.length }))
    emit('done')
  } catch (error) {
    console.error(error)
  } finally {
    working.value = false
  }
}

const canAssign = computed(() => {
  return conditionTagIds.value.length > 0
})

</script>

<template>
  <v-card>
    <v-card-title>
      {{ $t('assign_condition_tag_geo_respondents') }}
    </v-card-title>
    <v-card-text>
      <v-form>
        <ConditionTagAutocomplete v-model="conditionTagIds" />
        <v-checkbox
          v-model="includeChildren"
          :label="$t('include_child_locations')"
        />
        <v-checkbox
          v-model="onlyUseCurrentGeo"
          :label="$t('only_use_current_geo')"
        />
        <v-btn
          @click="assignConditionTagsViaGeo"
          :disabled="!canAssign || working"
        >
          {{ $t('assign') }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
