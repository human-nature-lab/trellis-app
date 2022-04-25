import EdgeServiceInterface, { SourceTarget } from './EdgeServiceInterface'
import Edge from '../../entities/trellis/Edge'
import DatabaseService from '../database'
import { In } from 'typeorm'

export default class EdgeServiceCordova implements EdgeServiceInterface {
  public cache = new Map<string, Edge>()

  async getEdges (edgeIds: string[]): Promise<Edge[]> {
    const res: Edge[] = []
    const edgeSet = new Set(edgeIds)
    for (const id of edgeIds) {
      if (this.cache.has(id)) {
        res.push(this.cache.get(id))
        edgeSet.delete(id)
      }
    }
    const repo = await DatabaseService.getRepository(Edge)
    const edges = await repo.find({
      where: {
        id: In(Array.from(edgeSet)),
      },
      relations: [
        'sourceRespondent',
        'targetRespondent',
        'sourceRespondent.names',
        'targetRespondent.names',
        'sourceRespondent.photos',
        'targetRespondent.photos',
      ],
    })
    for (const e of edges) {
      this.cache.set(e.id, e)
    }
    return res
  }

  async createEdges (edgeDefs: SourceTarget[]): Promise<Edge[]> {
    const repo = await DatabaseService.getRepository(Edge)
    const edges = edgeDefs.map(e => {
      const edge = new Edge()
      edge.sourceRespondentId = e.source_respondent_id
      edge.targetRespondentId = e.target_respondent_id
      return edge
    })
    const res = await repo.save(edges)
    return this.getEdges(res.map(e => e.id))
  }
}
