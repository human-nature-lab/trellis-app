import http from '@/services/http/AxiosInstance'
export default class EdgeServiceWeb {
  /**
   * Resolves to an array of edges with both source and target respondents included
   * @param {array} edgeIds - An array of valid edge ids
   * @returns {Promise<array>} - An array of edges with source and target included
   */
  static getEdges (edgeIds) {
    return http().get(`edges/${edgeIds.join(',')}`)
      .then(res => {
        return res.data.edges
      })
  }

  /**
   * Create the supplied edges on the server and return the created edges with respondent and edge id
   * @param {array} edges - An array objects with source_respondent_id and target_respondent_id defined
   * @returns {Promise<array>} - An array of edges with target_respondent defined
   */
  static createEdges (edges) {
    for (let edge of edges) {
      if (!edge.source_respondent_id || !edge.target_respondent_id) {
        throw Error('Edges must have both a source_respondent_id and a target_respondent_id defined')
      }
    }
    return http().post(`edges`, {
      edges: edges
    }).then(res => {
      return res.data.edges
    })
  }
}
