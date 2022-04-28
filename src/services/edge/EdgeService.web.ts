import http from '../http/AxiosInstance'
import EdgeServiceInterface, { SourceTarget } from './EdgeServiceInterface'
import Edge from '../../entities/trellis/Edge'
export default class EdgeServiceWeb implements EdgeServiceInterface {
  public cache = new Map<string, Edge>()

  async getEdges (edgeIds: string[]) {
    const res: Edge[] = []
    const edgeSet = new Set(edgeIds)
    for (const id of edgeIds) {
      if (this.cache.has(id)) {
        res.push(this.cache.get(id))
        edgeSet.delete(id)
      }
    }
    if (edgeSet.size) {
      const r = await http().get(`edges/${Array.from(edgeSet).join(',')}`)
      const edges = r.data.edges.map(e => new Edge().fromSnakeJSON(e))
      for (const edge of edges) {
        this.cache.set(edge.id, edge)
      }
      res.push(...edges)
    }
    return res
  }

  async createEdges (edges: SourceTarget[]) {
    if (!edges.length) return []
    // Validate edges
    for (const edge of edges) {
      if (!edge.source_respondent_id || !edge.target_respondent_id) {
        throw Error('Edges must have both a source_respondent_id and a target_respondent_id defined')
      }
    }
    const res = await http().post('edges', { edges: edges })
    const resEdges = res.data.edges.map(e => new Edge().fromSnakeJSON(e))
    for (const edge of resEdges) {
      this.cache.set(edge.id, edge)
    }
    return resEdges
  }
}
