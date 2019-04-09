<template>
  <v-menu
    offset-x
    max-width="60px"
    lazy>
    <v-btn icon slot="activator">
      <v-icon>more_vert</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile @click="$emit('edit')">
        <v-icon>edit</v-icon>
      </v-list-tile>
      <v-list-tile @click="$emit('remove')">
        <v-icon color="error">delete</v-icon>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>
