import EdgeServiceInterface, {SourceTarget} from './EdgeServiceInterface'
import Edge from '../../entities/trellis/Edge'
import DatabaseService from '../database/DatabaseService'
import { In } from 'typeorm'

export default class EdgeServiceCordova implements EdgeServiceInterface {
  async getEdges (edgeIds: string[]): Promise<Edge[]> {
    let repo = await DatabaseService.getRepository(Edge)
    return repo.find({
      where: {
        id: In(edgeIds)
      },
      relations: [
        'sourceRespondent',
        'targetRespondent',
        'sourceRespondent.names',
        'targetRespondent.names',
        'sourceRespondent.photos',
        'targetRespondent.photos'
      ]
    })
  }

  async createEdges (edgeDefs: SourceTarget[]): Promise<Edge[]> {
    let repo = await DatabaseService.getRepository(Edge)
    let edges = edgeDefs.map(e => {
      let edge = new Edge()
      edge.sourceRespondentId = e.source_respondent_id
      edge.targetRespondentId = e.target_respondent_id
      return edge
    })
    let res = await repo.save(edges)
    return this.getEdges(res.map(e => e.id))
  }
}
