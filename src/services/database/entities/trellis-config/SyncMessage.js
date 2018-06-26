import { EntitySchema } from 'typeorm'

export default new EntitySchema({
  name: 'SyncMessage',
  columns: {
    id: {
      primary: true,
      type: 'text',
      generated: false
    },
    syncId: {
      type: 'text'
    },
    messageId: {
      type: 'text'
    }
  }
})
