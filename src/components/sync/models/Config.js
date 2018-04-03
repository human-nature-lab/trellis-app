import Model from './Model'
class Config extends Model {
  constructor () {
    const tableName = 'config'
    const schema = [
      {'column': 'name', 'type': 'text', 'constraint': 'primary key not null'},
      {'column': 'val', 'type': 'text'}
    ]
    super(tableName, schema)
  }
}

export default new Config()
