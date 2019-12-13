import GeoType from '../../entities/trellis/GeoType'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

export default class GeoTypeServiceWeb {

  async all (): Promise<GeoType[]> {
    const res = await adminInst.get('geo/type')
    return res.data.geo_types.map(gt => new GeoType().fromSnakeJSON(gt))
  }

  async allStudyGeoTypes (studyId: string): Promise<GeoType[]> {
    const res = await adminInst.get(uriTemplate('study/{study}/geo/type', [studyId]))
    return res.data.geo_types.map(gt => new GeoType().fromSnakeJSON(gt))
  }

  async create (studyId: string, geoType: GeoType): Promise<GeoType> {
    const res = await adminInst.post(uriTemplate('study/{id}/geo/type', [studyId]), geoType.toSnakeJSON())
    return new GeoType().fromSnakeJSON(res.data.geo_type)
  }

  async update (geoType: GeoType): Promise<GeoType> {
    const res = await adminInst.put(uriTemplate('geo/type/{id}', [geoType.id]), geoType.toSnakeJSON())
    return new GeoType().fromSnakeJSON(res.data.geo_type)
  }

  async remove (geoTypeId: string): Promise<void> {
    const res = await adminInst.delete(uriTemplate('geo/type/{id}', [geoTypeId]))
    if (res.status > 205) {
      throw new Error(`Unable to remove geo type, ${geoTypeId}`)
    }
  }
}
