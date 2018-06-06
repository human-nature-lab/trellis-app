import { EntitySchema } from 'typeorm'

export default new EntitySchema({
  name: 'Config',
  columns: {
    name: {
      primary: true,
      type: 'text',
      generated: false
    },
    val: {
      type: 'text'
    }
  }
})
