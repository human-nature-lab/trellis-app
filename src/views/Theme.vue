<script lang="ts" setup>
const colors = ['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error', 'background']
const alertVariants = ['none', 'outlined', 'text']

</script>
<template>
  <v-col>
    <v-col>
      <h3>Buttons</h3>
      <v-row
        no-gutters
        class="justify-space-between"
      >
        <v-btn
          v-for="color in colors"
          :key="color"
          :color="color"
        >
          {{ color }}
        </v-btn>
      </v-row>
    </v-col>

    <v-col>
      <h3>Alerts</h3>
      <v-col
        v-for="variant in alertVariants"
        :key="variant"
      >
        <h4>{{ variant }}</h4>
        <v-alert
          v-for="color in colors"
          :key="color"
          :color="color"
          v-bind="{ [variant]: true }"
        >
          {{ color }}
        </v-alert>
      </v-col>
    </v-col>
  </v-col>
</template>
