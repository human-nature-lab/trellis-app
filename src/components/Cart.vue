<template>
  <v-layout row class="cart">
    <v-flex xs9 >
      <v-layout row class="items">
        <div
          v-for="item in items"
          :key="item.id">
          <slot v-bind:item="item">
            <div class="cart-item elevation-1">
              {{ item }}
            </div>
          </slot>
        </div>
      </v-layout>
    </v-flex>
    <v-flex xs3>
      <v-btn @click="$emit('done')">
        {{ $t('done') }}
      </v-btn>
    </v-flex>
  </v-layout>
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
.items
  overflow-y: auto
</style>
