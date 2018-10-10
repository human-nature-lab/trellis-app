<template>
  <div>
    <ul>
      <li>
        <slot></slot>
        <strong v-if="success" class="green--text">{{ _successMessage }}.</strong>
        <strong v-if="isWarning()" class="amber--text">{{$t('warning_word').toUpperCase()}}.</strong>
        <strong v-if="isError()" class="red--text">{{$t('error').toUpperCase()}}.</strong>
      </li>
    </ul>
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <v-progress-linear
      v-if="working"
      height="2"
      v-model="progress"
      :indeterminate="indeterminate"></v-progress-linear>
    <v-btn
      v-if="retry !== undefined && !working && !success"
      color="primary"
      @click="retry">{{$t('retry')}}</v-btn>
    <v-btn
      v-if="ignore !== undefined && !working && isWarning()"
      color="amber"
      @click="ignore">{{$t('ignore')}}</v-btn>
    <v-btn
      v-if="cancel !== undefined && working"
      flat
      @click="cancel">{{$t('stop')}}</v-btn>
  </div>
</template>

<script>
  import TrellisAlert from '../TrellisAlert.vue'
  import Log from '../../entities/trellis-config/Log'
  export default {
    name: 'sync-sub-step',
    data () {
      return {
        curWarning: 0,
        _successMessage: ''
      }
    },
    created () {
      if (this.successMessage) {
        this._successMessage = this.successMessage
      } else {
        this._successMessage = this.$t('ok')
      }
    },
    props: {
      progress: {
        type: Number,
        required: false,
        'default': 0
      },
      indeterminate: {
        type: Boolean,
        required: false,
        'default': true
      },
      working: {
        type: Boolean,
        required: false,
        'default': false
      },
      success: {
        type: Boolean,
        required: false,
        'default': false
      },
      successMessage: {
        type: String,
        required: false
      },
      currentLog: {
        required: false,
        validator: (value) => { return (value === undefined || value instanceof Log) }
      },
      cancel: {
        type: Function,
        required: false,
        'default': undefined
      },
      ignore: {
        type: Function,
        required: false,
        'default': undefined
      },
      retry: {
        type: Function,
        required: false,
        'default': undefined
      }
    },
    methods: {
      showLog: function () {
        return (this.currentLog !== undefined && this.currentLog instanceof Log)
      },
      isWarning: function () {
        return (this.currentLog instanceof Log && this.currentLog.severity === 'warn')
      },
      isError: function () {
        return (this.currentLog instanceof Log && this.currentLog.severity === 'error')
      }
    },
    computed: {
    },
    components: {
      TrellisAlert
    }
  }
</script>
