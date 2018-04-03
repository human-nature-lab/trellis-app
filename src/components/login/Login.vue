<template>
  <v-form>
    <v-text-field
      label="Username"
      v-model="name"
      required
    ></v-text-field>
    <v-text-field
      label="Password"
      v-model="password"
      required
    ></v-text-field>
  </v-form>
</template>

<script>
  export default {
    name: 'login',
    data: () => ({
      name: '',
      password: ''
    })
  }
</script>

