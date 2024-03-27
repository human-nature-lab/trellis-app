
import './monekypatch'
import DatabaseService from './DatabaseService'
import DatabaseServiceCordova from './DatabaseService.mobile'
import './debug'

export default new DatabaseService() as DatabaseServiceCordova