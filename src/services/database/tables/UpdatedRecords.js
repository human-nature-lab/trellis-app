import Table from './Table'
class UpdatedRecords extends Table {
  constructor () {
    const tableName = 'updated_records'
    const schema = [
      {'column': 'id', 'type': 'text', 'constraint': 'primary key not null'},
      {'column': 'updated_record_id', 'type': 'text'},
      {'column': 'is_update', 'type': 'text'},
      {'column': 'uploaded_at', 'type': 'text'}
    ]
    super(tableName, schema)
  }
}

export default new UpdatedRecords()
