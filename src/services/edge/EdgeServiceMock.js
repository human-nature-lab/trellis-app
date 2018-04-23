import MockService from '../mock/MockService'
import uuid from 'uuid/v4'
export default class EdgeServiceMock {
  /**
   * Resolves to an edge with both source and target respondents included
   * @param edgeIds
   * @returns {Promise<any>}
   */
  static getEdges (edgeIds) {
    return MockService.randomlyFail(resolve => {
      return edgeIds.map(id => (JSON.parse(JSON.stringify({
        source_respondent: {
          id: uuid(),
          name: 'me',
          photos: [{
            id: 'ok'
          }]
        },
        target_respondent: {
          id: uuid(),
          name: 'Random person for edge: ' + id,
          photos: [{
            id: 'wa'
          }]
        }
      }))))
    }, 400, 0.05)
  }

  /**
   * Create the provided edges in a transaction. Each edge should have a source_respondent_id and target_respondent_id
   * property
   * @param edges
   * @returns {Promise<any>}
   */
  static createEdges (edges) {
    for (let edge of edges) {
      if (!edge.source_respondent_id || !edge.target_respondent_id) {
        throw Error('Edges must have both a source_respondent_id and a target_respondent_id defined')
      }
    }
    return MockService.randomlyFail(resolve => {
      return resolve({
        edges: edges.map((edge, i) => {
          edge.id = uuid()
          edge.target_respondent = {
            id: uuid(),
            name: 'Random person: ' + i,
            photos: [{
              id: uuid()
            }]
          }
        })
      })
    }, 300, 0.05)
  }

}
