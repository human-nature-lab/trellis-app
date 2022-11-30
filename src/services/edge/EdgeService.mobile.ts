import EdgeServiceInterface, { SourceTarget } from './EdgeServiceInterface'
import Edge from '../../entities/trellis/Edge'
import DatabaseService from '../database'
import { In, IsNull } from 'typeorm'
import RespondentPhoto from '../../entities/trellis/RespondentPhoto'
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
      ],
    })
    await this.setEdgePhotos(edges)
    for (const e of edges) {
      this.cache.set(e.id, e)
    }
    return res.concat(edges)
  }

  async setEdgePhotos (edges: Edge[]) {
    const photoRepo = await DatabaseService.getRepository(RespondentPhoto)
    const respondentIds = []
    const sourceMap = new Map<string, Edge[]>()
    const targetMap = new Map<string, Edge[]>()
    for (const e of edges) {
      e.sourceRespondent.photos = []
      e.targetRespondent.photos = []
      if (!sourceMap.has(e.sourceRespondentId)) {
        sourceMap.set(e.sourceRespondentId, [e])
      } else {
        sourceMap.get(e.sourceRespondentId).push(e)
      }
      if (!targetMap.has(e.targetRespondentId)) {
        targetMap.set(e.targetRespondentId, [e])
      } else {
        targetMap.get(e.targetRespondentId).push(e)
      }
      respondentIds.push(e.sourceRespondentId, e.targetRespondentId)
    }
    const resPhotos = await photoRepo.find({
      where: {
        respondentId: In(respondentIds),
        deletedAt: IsNull(),
      },
      relations: [
        'photo',
      ],
      order: {
        sortOrder: 'ASC',
      },
    })
    for (const p of resPhotos) {
      if (!p.photo.deletedAt) {
        if (sourceMap.has(p.respondentId)) {
          for (const e of sourceMap.get(p.respondentId)) {
            e.sourceRespondent.photos.push(p.photo)
          }
        }
        if (targetMap.has(p.respondentId)) {
          for (const e of targetMap.get(p.respondentId)) {
            e.targetRespondent.photos.push(p.photo)
          }
        }
      }
    }
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
