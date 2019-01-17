<template>
    <v-flex class="red" v-if="isInDebugMode">
      <v-expansion-panel>
        <v-expansion-panel-content>
          <div class="debug-name" slot="header">DEBUG: {{this.name}}</div>
          <v-card>
            <v-card-text>
              <slot></slot>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-flex>
</template>

<script>
  import config from '@/config'
  export default {
    name: 'debug',
    props: {
      name: {
        type: String,
        default: 'Debug'
      }
    },
    data: function () {
      return {
        isOpen: false
      }
    },
    computed: {
      isInDebugMode: function () {
        return config.debug
      }
    }
  }

</script>
