import Edge from '../../entities/trellis/Edge'

export interface SourceTarget {
  source_respondent_id: string
  target_respondent_id: string
}

export default interface EdgeServiceInterface {
  cache: Map<string, Edge>
  /**
   * Resolves to an array of edges with both source and target respondents included
   * @param {string[]} edgeIds
   * @returns {Promise<Edge[]>}
   */
  getEdges (edgeIds: string[]): Promise<Edge[]>

  /**
   * Create the supplied edges on the server and return the created edges with respondent and edge id
   * @param {SourceTarget[]} edges
   * @returns {Promise<Edge[]>}
   */
  createEdges (edges: SourceTarget[]): Promise<Edge[]>
}
