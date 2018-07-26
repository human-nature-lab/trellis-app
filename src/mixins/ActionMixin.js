import actionBus from '../components/interview/services/ActionBus'
export default {
  methods: {
    action (type, payload) {
      if (!this.question || !this.question.id) {
        throw new Error('Unable to use action mixin without defining the question')
      }
      actionBus.action({
        action_type: type,
        question_id: this.question.id,
        payload
      })
    }
  }
}
