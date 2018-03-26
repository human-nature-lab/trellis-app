import uuid from 'uuid/v4'
export default {
  'select-choice': function (dataStore, action, question) {
    let data = question.data
    data.push({
      datum_id: uuid(),
      val: question.choices.find(choice => choice.id === action.choice_id)
    })
    dataStore.setQuestionData(data, question.id)
  },
  'deselect-choice': function (dataStore, action, question) {
    let data = question.data
    data.splice()
    dataStore.setQuestionData(question.id)
  }
}
