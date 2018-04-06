import Vue from 'vue'
// A shared event emitter for sharing data between components without a parent child relationship. This one is used for
// emitting and acting on actions exclusively
export const actionBus = new Vue()
export default actionBus
