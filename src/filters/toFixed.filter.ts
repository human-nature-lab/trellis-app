import Vue from 'vue'
Vue.filter('toFixed', function (value: number, numDigits: number = 2) {
  return value.toFixed(numDigits)
})
