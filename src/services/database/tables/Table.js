class Table {
  constructor (tableName, schema) {
    this.tableName = tableName
    this.schema = schema
  }
  getCreateTableStatement () {
    let createTable = `create table if not exists "${this.tableName}" `
    let columnDefinition = this.schema.map(c => ` "${c.column}" ${c.type} ${(c.hasOwnProperty('constraint') ? c.constraint : '')}`
    ).join(', ')
    return `${createTable} (${columnDefinition});`
  }
}

export default Table
