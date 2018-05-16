<template>
    <v-container class="cart">
      <v-layout row>
        <v-flex xs9>
          <v-layout row class="items">
            <div
              class="cart-item"
              v-for="item in items"
              :key="item">
              {{item}}
            </div>
          </v-layout>
        </v-flex>
        <v-flex xs3>
          <v-btn @click="$emit('done')">Done</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
</template>

<script>
  export default {
    name: 'cart',
    props: {
      items: {
        type: Array,
        required: true
      }
    }
  }
</script>

<style lang="sass" scoped>
.cart
  background: white
  max-height: 150px
.cart-item
  height: 100px
  width: 100px
  flex-shrink: 0
  box-sizing: border-box
  border: 1px solid grey
.items
  overflow-y: auto
</style>
