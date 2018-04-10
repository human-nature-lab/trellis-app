import _ from 'lodash'
export default class InterviewDataMock {
  constructor (actions, data, conditions) {
    this.prevActions = JSON.parse(JSON.stringify(actions))
    this.prevData = JSON.parse(JSON.stringify(data))
    this.prevConditions = JSON.parse(JSON.stringify(conditions))
    this.actions = actions
    this.data = data
    this.conditions = conditions
    this.update = _.debounce(this.update.bind(this), 1000)
  }
  update () {
    // Get the new actions and print them
    let newActions = this.actions.slice(this.prevActions.length - 1, this.actions.length)
    console.log('New actions: ', newActions)
    this.prevActions = JSON.parse(JSON.stringify(this.actions))
    // TODO: Add dataDiff and conditions diff here
  }
}
