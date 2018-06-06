import { EntitySchema } from 'typeorm'

export default new EntitySchema({
  name: 'UpdatedRecords',
  columns: {
    id: {
      primary: true,
      type: 'text',
      generated: false
    },
    updatedRecordId: {
      type: 'text'
    },
    isUpdate: {
      type: 'boolean'
    },
    uploadedAt: {
      type: 'datetime'
    }
  }
})
