class SyncStep {
  constructor () {
    this.statusMessage = 'THIS STATUS MESSAGE SHOULD BE OVERRIDDEN BY THE IMPLEMENTING CLASS'
  }
  getCreateTableStatement () {
    let createTable = `create table if not exists "${this.tableName}" `
    let columnDefinition = this.schema.map(c => ` "${c.column}" ${c.type} ${(c.hasOwnProperty('constraint') ? c.constraint : '')}`
    ).join(', ')
    return `${createTable} (${columnDefinition});`
  }
}

export default SyncStep
