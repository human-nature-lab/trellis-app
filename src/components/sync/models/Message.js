import Model from './Model'
class Message extends Model {
  constructor () {
    const tableName = 'message'
    const schema = [
      {'column': 'id', 'type': 'text', 'constraint': 'primary key not null'},
      {'column': 'message', 'type': 'text'},
      {'column': 'type', 'type': 'text'},
      {'column': 'created_at', 'type': 'text'}
    ]
    super(tableName, schema)
  }
}

export default new Message()
