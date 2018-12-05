import GeoPhoto from '../entities/trellis/GeoPhoto'
import RespondentPhoto from '../entities/trellis/RespondentPhoto'
import DatumPhoto from '../entities/trellis/DatumPhoto'

class PhotoPivotTable {
  id: string
  sortOrder: number
  notes: string
  entityId: string
  photoId: string
}

export default class PhotoWithPivotTable {
  id: string
  fileName: string
  pivot: PhotoPivotTable

  constructor(joinTable: RespondentPhoto|GeoPhoto|DatumPhoto) {
    let entityId: string = ''
    if (joinTable instanceof RespondentPhoto) {
      entityId = joinTable.respondentId
    } else if (joinTable instanceof GeoPhoto) {
      entityId = joinTable.geoId
    } else if (joinTable instanceof DatumPhoto) {
      entityId = joinTable.datumId
    }

    this.id = joinTable.photo.id
    this.fileName = joinTable.photo.id
    let pivot = new PhotoPivotTable()
    pivot.id = joinTable.id
    pivot.sortOrder = joinTable.sortOrder
    pivot.notes = joinTable.notes
    pivot.entityId = entityId
    pivot.photoId = joinTable.photoId
    this.pivot = pivot
  }
}
