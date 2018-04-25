import MockService from '../mock/MockService'
import uuid from 'uuid/v4'
import storage from '@/services/storage/StorageService'
import RespondentService from '../respondent/RespondentService'
export default class EdgeServiceMock {
  /**
   * Resolves to an edge with both source and target respondents included
   * @param edgeIds
   * @returns {Promise<any>}
   */
  static getEdges (edgeIds) {
    return MockService.randomlyFail(resolve => {
      return resolve(edgeIds.map(id => {
        return storage.get(`edge-${id}`, 'object')
      }))
    }, EdgeServiceMock.DELAY, EdgeServiceMock.FAILURE_RATE)
  }

  /**
   * Create the provided edges in a transaction. Each edge should have a source_respondent_id and target_respondent_id
   * property
   * @param {array} edges - An array objects with source_respondent_id and target_respondent_id defined
   * @returns {Promise<array>} - An array of edges
   */
  static createEdges (edges) {
    for (let edge of edges) {
      if (!edge.source_respondent_id || !edge.target_respondent_id) {
        throw Error('Edges must have both a source_respondent_id and a target_respondent_id defined')
      }
    }
    return MockService.randomlyFail(resolve => {
      return resolve(Promise.all(edges.map(edge => {
        return RespondentService.getRespondentById(edge.target_respondent_id)
      })).then(respondents => {
        for (let i = 0; i < edges.length; i++) {
          edges[i].id = uuid()
          edges[i].target_respondent = respondents[i]
          storage.set(`edge-${edges[i].id}`, edges[i])
        }
        return edges
      }))
    }, EdgeServiceMock.DELAY, EdgeServiceMock.FAILURE_RATE)
  }

}

EdgeServiceMock.FAILURE_RATE = 0
EdgeServiceMock.DELAY = 200
