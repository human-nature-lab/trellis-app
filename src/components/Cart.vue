<template>
  <v-container fluid>
    <v-layout row class="cart">
      <v-flex>
        <v-layout row wrap class="items">
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
      <v-spacer />
      <v-btn
        @click="$emit('done')"
        class="primary--text">
        {{ $t('done') }}
      </v-btn>
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
  /*max-height: 150px*/
.cart-item
  height: 100px
  width: 100px
  flex-shrink: 0
  box-sizing: border-box
.items
  overflow-y: auto
</style>
