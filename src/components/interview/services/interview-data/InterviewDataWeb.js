export default class InterviewDataService {
  constructor (data, conditions) {
    this.routes = {
      data: 'interview/data',
      conditions: 'interview/conditions'
    }
    this.data = data
    this.conditions = conditions
  }

  update () {

  }

}
