import Table from './Table'
class SyncTable extends Table {
  constructor () {
    const tableName = 'sync'
    const schema = [
      {'column': 'id', 'type': 'text', 'constraint': 'primary key not null'},
      {'column': 'type', 'type': 'text'},
      {'column': 'status', 'type': 'text'},
      {'column': 'device_id', 'type': 'text'},
      {'column': 'file_name', 'type': 'text'},
      {'column': 'created_at', 'type': 'text'}
    ]
    super(tableName, schema)
  }
}

export default new SyncTable()
