import { EntitySchema } from 'typeorm'

export default new EntitySchema({
  name: 'Sync',
  columns: {
    id: {
      primary: true,
      type: 'text',
      generated: false
    },
    type: {
      type: 'text'
    },
    status: {
      type: 'text'
    },
    deviceId: {
      type: 'text'
    },
    fileName: {
      type: 'text'
    },
    createdAt: {
      type: 'datetime'
    }
  },
  relations: {
    messages: {
      target: 'Message',
      type: 'many-to-many',
      joinTable: true,
      cascade: true
    }
  }
})
