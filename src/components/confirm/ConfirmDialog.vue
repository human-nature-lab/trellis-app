<script setup lang="ts">
import { confirmRef, visible, message, resolver } from '.'
</script>

<template>
  <TrellisModal
    v-model="visible"
    :title="$t('confirm')"
    :ref="confirmRef"
    persistent
  >
    <v-col>
      {{ message }}
    </v-col>
    <v-row no-gutters>
      <v-btn
        @click="resolver(true)"
        color="primary"
      >
        {{ $t('confirm') }}
      </v-btn>
      <v-btn
        @click="resolver(false)"
        color="error"
      >
        {{ $t('cancel') }}
      </v-btn>
    </v-row>
  </TrellisModal>
</template>
