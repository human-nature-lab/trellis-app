import PersistSlave from '../../../classes/PersistSlave'
import DiffService from './DiffService'
import InterviewService from '../../../services/interview/InterviewService'
import InterviewDeltaInterface from '../../../services/interview/InterviewDeltaInterface'
import DataStore from "../classes/DataStore";
import InterviewDataInterface from "../../../services/interview/InterviewDataInterface";

/**
 * Create a persist slave for a DataStore that uses the InterviewDataService to sync up data using delta encoding
 * @param {DataStore} dataStore - The datastore object to watch for changes
 * @param {Number} [throttleRate = 10000] - How often should we make requests to store the data (milliseconds)
 * @returns {PersistSlave}
 */
export default function dataPersistSlave (interviewId: string, dataStore: DataStore, throttleRate: number = 10000): PersistSlave {
  function dataExtractor (): InterviewDataInterface {
    return {
      data: dataStore.data,
      conditionTags: dataStore.conditionTags
    }
  }
  function saveData (newState: InterviewDataInterface, prevState: InterviewDataInterface): Promise<any> {
    let dataDiff = DiffService.dataDiff(newState.data, prevState.data)
    let tagDiff = DiffService.conditionTagsDiff(newState.conditionTags, prevState.conditionTags)
    let diff = new InterviewDeltaInterface(dataDiff, tagDiff)
    // console.log('saving data', JSON.stringify(newState, null, 2))
    return InterviewService.saveData(interviewId, diff)
  }
  function shouldSave (newState: InterviewDataInterface, prevState: InterviewDataInterface) {
    return true
  }

  return new PersistSlave(dataStore, dataExtractor, saveData, shouldSave, throttleRate)
}
