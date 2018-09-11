import http from '../http/AxiosInstance'
import EdgeServiceInterface from './EdgeServiceInterface'
import Edge from '../../entities/trellis/Edge'
export default class EdgeServiceWeb implements EdgeServiceInterface {
  async getEdges (edgeIds) {
    let res = await http().get(`edges/${edgeIds.join(',')}`)
    return res.data.edges.map(e => new Edge().fromSnakeJSON(e))
  }

  async createEdges (edges) {
    if (!edges.length) return []
    // Validate edges
    for (let edge of edges) {
      if (!edge.source_respondent_id || !edge.target_respondent_id) {
        throw Error('Edges must have both a source_respondent_id and a target_respondent_id defined')
      }
    }
    let res = await http().post(`edges`, { edges: edges })
    return res.data.edges.map(e => new Edge().fromSnakeJSON(e))
  }
}
