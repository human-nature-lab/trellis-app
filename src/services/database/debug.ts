import config from '../../config'

// Add methods for running queries directly on the tablet
if (config.debug) {
  const runQuery = async function (query: string, parameters?: string[], db?: string) {
    const dbService = (await import('./')).default
    db = db || 'trellis'
    try {
      return (await (db === 'trellis' ? dbService.getDatabase() : dbService.getConfigDatabase())).query(query, parameters)
    } catch (err) {
      console.dir(err)
    }
  }
  // @ts-ignore
  window.q = runQuery
  // @ts-ignore
  window.ql = async function (query, parameters, db) {
    const r = await runQuery(query, parameters, db)
    console.log(r)
    return r
  }
  // @ts-ignore
  window.c = async function (query, parameters, db) {
    const r = await runQuery(query, parameters, db)
    for (const row of r) {
      // console.log(JSON.stringify(row))
      console.log(row)
    }
    console.log(`${r.length} rows`)
    return r
  }
}
