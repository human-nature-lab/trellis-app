import DeviceService from '@/services/device/DeviceService'
import 'reflect-metadata'
import { createConnection, getConnection } from 'typeorm'
import Config from '../../entities/trellis-config/Config'
import Action from '../../entities/trellis/Action'
import AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import CensusType from '../../entities/trellis/CensusType'
import Choice from '../../entities/trellis/Choice'
import ConditionTag from '../../entities/trellis/ConditionTag'
import Datum from '../../entities/trellis/Datum'
import DatumType from '../../entities/trellis/DatumType'
import Edge from '../../entities/trellis/Edge'
import Form from '../../entities/trellis/Form'
import FormSection from '../../entities/trellis/FormSection'
import FormSkip from '../../entities/trellis/FormSkip'
import FormType from '../../entities/trellis/FormType'
import Geo from '../../entities/trellis/Geo'
import GeoPhoto from '../../entities/trellis/GeoPhoto'
import GeoType from '../../entities/trellis/GeoType'
import Interview from '../../entities/trellis/Interview'
import Locale from '../../entities/trellis/Locale'
import Parameter from '../../entities/trellis/Parameter'
import Photo from '../../entities/trellis/Photo'
import PhotoTag from '../../entities/trellis/PhotoTag'
import Question from '../../entities/trellis/Question'
import QuestionAssignConditionTag from '../../entities/trellis/QuestionAssignConditionTag'
import QuestionChoice from '../../entities/trellis/QuestionChoice'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import QuestionGroup from '../../entities/trellis/QuestionGroup'
import QuestionGroupSkip from '../../entities/trellis/QuestionGroupSkip'
import QuestionParameter from '../../entities/trellis/QuestionParameter'
import QuestionType from '../../entities/trellis/QuestionType'
import Respondent from '../../entities/trellis/Respondent'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import RespondentFill from '../../entities/trellis/RespondentFill'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentPhoto from '../../entities/trellis/RespondentPhoto'
import Roster from '../../entities/trellis/Roster'
import Section from '../../entities/trellis/Section'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import SectionQuestionGroup from '../../entities/trellis/SectionQuestionGroup'
import SectionSkip from '../../entities/trellis/SectionSkip'
import Skip from '../../entities/trellis/Skip'
import SkipConditionTag from '../../entities/trellis/SkipConditionTag'
import Study from '../../entities/trellis/Study'
import StudyForm from '../../entities/trellis/StudyForm'
import StudyLocale from '../../entities/trellis/StudyLocale'
import StudyParameter from '../../entities/trellis/StudyParameter'
import StudyRespondent from '../../entities/trellis/StudyRespondent'
import Survey from '../../entities/trellis/Survey'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'
import Tag from '../../entities/trellis/Tag'
import Translation from '../../entities/trellis/Translation'
import TranslationText from '../../entities/trellis/TranslationText'
import User from '../../entities/trellis/User'
import UserStudy from '../../entities/trellis/UserStudy'
import Log from '../../entities/trellis-config/Log'
import Sync from '../../entities/trellis-config/Sync'
import FileService from '../file/FileService'
import SnakeCaseNamingStrategy from './SnakeCaseNamingStrategy'
import PreloadAction from '../../entities/trellis/PreloadAction'

const trellisConfigConnection = {
  type: 'cordova',
  database: 'trellis-config',
  name: 'trellis-config',
  location: 'default',
  entities: [
    Config,
    Log,
    Sync
  ],
  logging: true,
  synchronize: true
}

const trellisConnection = {
  type: 'cordova',
  database: 'trellis',
  name: 'trellis',
  location: 'default',
  entities: [
    Action,
    AssignConditionTag,
    CensusType,
    Choice,
    ConditionTag,
    Datum,
    DatumType,
    Edge,
    Form,
    FormSection,
    FormSkip,
    FormType,
    Geo,
    GeoPhoto,
    GeoType,
    Interview,
    Locale,
    Parameter,
    Photo,
    PhotoTag,
    PreloadAction,
    Question,
    QuestionAssignConditionTag,
    QuestionChoice,
    QuestionDatum,
    QuestionGroup,
    QuestionGroupSkip,
    QuestionParameter,
    QuestionType,
    Respondent,
    RespondentConditionTag,
    RespondentFill,
    RespondentGeo,
    RespondentName,
    RespondentPhoto,
    Roster,
    Section,
    SectionConditionTag,
    SectionQuestionGroup,
    SectionSkip,
    Skip,
    SkipConditionTag,
    Study,
    StudyForm,
    StudyLocale,
    StudyParameter,
    StudyRespondent,
    Survey,
    SurveyConditionTag,
    Tag,
    Translation,
    TranslationText,
    User,
    UserStudy
  ],
  namingStrategy: new SnakeCaseNamingStrategy(),
  logging: ['warning', 'error'] // reduced logging
  // logging: true // verbose logging
}

export default class DatabaseServiceCordova {
  constructor () {
    this.databaseCreated = this.createDatabase()
    this.configDatabaseCreated = this.createConfigDatabase()
  }

  createDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConnection))
      .then((connection) => connection.createQueryRunner())
      .then((queryRunner) => this.createUpdatedRecordsTable(queryRunner, {}))
  }

  async getDatabase () {
    await this.databaseCreated
    return getConnection('trellis')
  }

  async getRepository (...args) {
    const conn = await this.getDatabase()
    let repo = await conn.getRepository(...args)
    return repo
  }

  createConfigDatabase () {
    return DeviceService.isDeviceReady()
      .then(() => createConnection(trellisConfigConnection))
  }

  async getConfigDatabase () {
    await this.configDatabaseCreated
    return getConnection('trellis-config')
  }

  async createUpdatedRecordsTable (queryRunner, status) {
    try {
      await queryRunner.query(`create table if not exists updated_records (table_name text, updated_record_id text, uploaded_at datetime);`)
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async addTriggers (queryRunner, status) {
    try {
      const operations = ['update', 'insert']
      const tableNameResults = await queryRunner.query('select tbl_name from SQLite_master where type = "table"')
      const tableNames = tableNameResults.map((tableNameObject) => { return tableNameObject['tbl_name'] })
      console.log('tableNames', tableNames)
      tableNames.forEach(async (tableName) => {
        if (tableName !== 'updated_records') {
          operations.forEach(async (operation) => {
            await queryRunner.query(
              `create trigger if not exists trigger__updated_records__${operation}__${tableName} 
               after ${operation} on ${tableName} 
                 BEGIN 
                   insert into updated_records (table_name, updated_record_id) values ('${tableName}',NEW.id);
                 END;`
            )
          })
        }
      })
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async removeDatabase (status) {
    const connection = await this.getDatabase()
    const queryRunner = await connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.query('PRAGMA foreign_keys = OFF;')
    await queryRunner.startTransaction()
    try {
      const selectDropsQuery = `SELECT 'DROP TABLE "' || name || '";' as query FROM "sqlite_master" WHERE "type" = 'table' AND "name" != 'sqlite_sequence'`
      const dropQueries = await queryRunner.query(selectDropsQuery)
      await Promise.all(dropQueries.map(q => queryRunner.query(q['query'])))
      return queryRunner
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async executeSnapshot (queryRunner, file, trackProgress, isCancelled) {
    return new Promise((resolve, reject) => {
      const decoder = new TextDecoder()
      const fileReader = new FileReader(file)
      const CHUNK_SIZE = 1024000
      let start = 0
      let fileSize = file.size
      let end = Math.min(fileSize, (start + CHUNK_SIZE))
      let inQuotes = false
      let escaped = false
      let buffer = ''
      fileReader.onload = async function (event) {
        try {
          trackProgress({inserted: start, total: fileSize})
          buffer += decoder.decode(event.target.result, {stream: true})
          for (let curChar = 0; curChar < buffer.length; curChar++) {
            let char = buffer.charAt(curChar)
            if (!escaped && char === '\'') {
              inQuotes = !inQuotes
            }
            if (escaped) {
              escaped = false
            } else {
              if (char === '\\') {
                escaped = true
              }
            }
            if (!inQuotes) {
              if (char === ';') {
                let query = buffer.substring(0, (curChar + 1))
                await queryRunner.query(query)
                buffer = buffer.substring(curChar + 1, buffer.length)
                curChar = 0
              }
            }
          }
          if (end < fileSize) {
            if (isCancelled()) {
              await queryRunner.rollbackTransaction()
              resolve()
            } else {
              start += CHUNK_SIZE
              end = Math.min(fileSize, (end + CHUNK_SIZE))
              let slice = file.slice(start, end)
              inQuotes = false
              escaped = false
              fileReader.readAsArrayBuffer(slice)
            }
          } else {
            resolve()
          }
        } catch (err) {
          reject(err)
        }
      }
      fileReader.onerror = (error) => { reject(error) }
      let slice = file.slice(start, end)
      fileReader.readAsArrayBuffer(slice)
    })
  }

  async importDatabase (queryRunner, extractedSnapshot, trackProgress, isCancelled, status) {
    const file = await FileService.fileFromFileEntry(extractedSnapshot)
    try {
      await this.executeSnapshot(queryRunner, file, trackProgress, isCancelled)
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.query('PRAGMA foreign_keys = ON;')
    }
  }

  async checkForeignKeys (queryRunner, status) {
    try {
      await queryRunner.query('PRAGMA foreign_key_check;')
      await queryRunner.commitTransaction()
    } catch (err) {
      status.message = 'Rolling back transaction...'
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async getLatestDownload () {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const queryBuilder = await repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', {type: 'download'})
      .andWhere('status = :status', {status: 'success'})
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getLatestUpload () {
    const connection = await this.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    const queryBuilder = await repository.createQueryBuilder('sync')
    return queryBuilder
      .where('type = :type', {type: 'upload'})
      .where('status = :status', {status: 'success'})
      .orderBy('sync.createdAt', 'DESC')
      .limit(1)
      .getOne()
  }

  async getUpdatedRecordsCount () {
    const connection = await this.getDatabase()
    const updatedRecords = await connection.query(
      `select *
        from updated_records
        where uploaded_at is null;`)
    console.log('updatedRecords', updatedRecords)
    const totalRowResults = await connection.query(
      `select count(*) as total_rows
        from updated_records
        where uploaded_at is null;`)
    return totalRowResults[0]['total_rows']
  }
}
