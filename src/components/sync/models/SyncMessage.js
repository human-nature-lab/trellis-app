import Model from './Model'
class SyncMessage extends Model {
  constructor () {
    const tableName = 'sync_message'
    const schema = [
      {'column': 'id', 'type': 'text', 'constraint': 'primary key not null'},
      {'column': 'sync_id', 'type': 'text', 'constraint': 'not null'},
      {'column': 'message_id', 'type': 'text', 'constraint': 'not null'}
    ]
    super(tableName, schema)
  }
}

export default new SyncMessage()
