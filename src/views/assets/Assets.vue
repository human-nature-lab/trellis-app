<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import saveAs from 'file-saver'
import { i18n } from '@/i18n'
import FormatBytes from '@/filters/format-bytes.filter'
import { routeQueue } from '@/router'
import Asset from '@/entities/trellis/Asset'
import AssetService from '@/services/asset'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'
import { relativeTime } from '@/filters/date'
import TrellisFileUpload from '@/components/import/TrellisFileUpload.vue'

const assets = ref<Asset[]>([])
const loading = ref(false)
const showUpload = ref(false)
const search = ref('')
const selected = ref<Asset[]>([])
const tableHeaders = computed(() => [{
  text: i18n.t('filename'),
  value: 'fileName',
}, {
  text: i18n.t('filesize'),
  value: 'size',
}, {
  text: i18n.t('file_type'),
  value: 'type',
}, {
  text: i18n.t('should_sync'),
  value: 'shouldSync',
}, {
  text: i18n.t('created_at'),
  value: 'createdAt',
}, {
  text: '',
  value: 'actions',
}])

async function fetchAssets () {
  if (loading.value) return
  loading.value = true
  try {
    assets.value = await AssetService.getAssets()
  } catch (e) {
    if (isNotAuthError(e)) {
      logError(e)
    }
  } finally {
    loading.value = false
  }
}

async function createAsset (file: File) {
  if (loading.value) return
  loading.value = true
  try {
    const data = {
      fileName: file.name,
      shouldSync: false,
    }
    const asset = await AssetService.createAsset(data, file)
    assets.value.push(asset)
  } catch (e) {
    logError(e)
    throw e
  } finally {
    loading.value = false
  }
}

async function uploadFile (file: File) {
  await createAsset(file)
}

async function downloadAsset (asset: Asset) {
  if (loading.value) return
  loading.value = true
  try {
    const data = await AssetService.downloadAsset(asset.id)
    saveAs(data, asset.fileName)
  } catch (e) {
    logError(e)
  } finally {
    loading.value = false
  }
}

const deleteConfirmation = computed(() => {
  if (selected.value.length === 1) {
    return i18n.t('confirm_delete_single', { asset: selected.value[0].fileName }) as string
  }
  return i18n.t('confirm_delete_multiple_asset', { count: selected.value.length }) as string
})

async function deleteAssets () {
  if (loading.value) return
  loading.value = true
  try {
    if (!confirm(deleteConfirmation.value as string)) return
    const ids = selected.value.map(a => a.id)
    await AssetService.deleteAssets(...ids)
    assets.value = assets.value.filter((a) => !ids.includes(a.id))
    selected.value = []
  } catch (e) {
    logError(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAssets()
})
</script>

<template>
  <v-col>
    <v-row no-gutters>
      <h3>{{ $t('assets') }}</h3>
      <v-spacer />
      <v-text-field
        v-model="search"
        dense
        :placeholder="$t('search')"
      />
      <v-btn
        @click="showUpload = true"
        icon
        :disabled="loading"
        class="ml-2"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        @click="deleteAssets"
        :disabled="!selected.length"
        color="error"
        icon
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-row>
    <v-data-table
      v-model="selected"
      show-select
      :items="assets"
      :loading="loading"
      :search="search"
      :headers="tableHeaders"
    >
      <template #item.size="{ item }">
        {{ FormatBytes(item.size) }}
      </template>
      <template #item.createdAt="{ item }">
        {{ relativeTime(item.createdAt) }}
      </template>
      <template #item.shouldSync="{ item }">
        <v-icon v-if="item.shouldSync">
          mdi-check
        </v-icon>
      </template>
      <template #item.actions="{ item }">
        <v-row class="no-gutters actions flex-nowrap">
          <v-btn
            @click="downloadAsset(item)"
            icon
            :disabled="loading"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn
            :to="{ name: 'Asset', params: { id: item.id } }"
            icon
            class="ml-2"
          >
            <v-icon>mdi-arrow-right-bold-box-outline</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-table>
    <TrellisFileUpload
      v-model="showUpload"
      :title="$t('upload_assets')"
      :upload-file="uploadFile"
      multiple
      :persistent="loading"
    />
  </v-col>
</template>

<style lang="sass" scoped>
tr:hover
  .actions
    visibility: visible
.actions
  visibility: hidden
</style>
