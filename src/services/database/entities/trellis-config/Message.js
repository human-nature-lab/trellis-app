import { EntitySchema } from 'typeorm'

export default new EntitySchema({
  name: 'Message',
  columns: {
    id: {
      primary: true,
      type: 'text',
      generated: false
    },
    message: {
      type: 'text'
    },
    type: {
      type: 'text'
    },
    createdAt: {
      type: 'datetime'
    }
  }
})
