<template>
  <v-container>
    <v-col>
      <v-btn :to="{ name: 'NearbyServer' }">
        {{ $t('start_server') }}
      </v-btn>
    </v-col>
    <v-col>
      <v-btn :to="{ name: 'NearbyClient' }">
        {{ $t('join_server') }}
      </v-btn>
    </v-col>
  </v-container>
</template>
