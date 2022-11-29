<template>
  <v-container fluid>
    <v-row class="cart">
      <v-col sm="10">
        <v-row wrap class="pa-6 items align-center">
          <div
            class="mr-1"
            v-for="item in items"
            :key="item.id">
            <slot v-bind:item="item">
              <div class="cart-item elevation-1">
                {{ item }}
              </div>
            </slot>
          </div>
        </v-row>
      </v-col>
      <v-col sm="2">
        <v-btn
          @click="$emit('done')"
          class="primary--text">
          {{ $t('done') }}
        </v-btn>
      </v-col>
    </v-row>
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
  /*max-height: 150px*/
.cart-item
  height: 100px
  width: 100px
  flex-shrink: 0
  box-sizing: border-box
.items
  overflow-y: auto
</style>
