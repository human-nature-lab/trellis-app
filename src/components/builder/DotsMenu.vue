<template>
  <v-menu left offset-x>
    <template #activator="{ on, attrs }">
      <v-btn class="ml-3" text icon v-on="on" v-bind="{ ...attrs, ...$attrs }">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <slot />
  </v-menu>
</template>