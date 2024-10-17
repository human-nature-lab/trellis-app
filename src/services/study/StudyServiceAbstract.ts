import User from '../../entities/trellis/User'
import Study from '../../entities/trellis/Study'
import SingletonService, { StorageKey } from '../SingletonService'

export abstract class StudyServiceAbstract {
  getCurrentStudy (): Study | undefined {
    const study = SingletonService.get(StorageKey.study)
    return (study instanceof Study) ? study : undefined
  }

  setCurrentStudy (study: Study): void {
    SingletonService.setCurrentStudy(study)
  }

  abstract getProdStudyFromTest (studyId: string): PromiseLike<Study | undefined>

  abstract getStudy (studyId: string): PromiseLike<Study | undefined>

  abstract getMyStudies (testMode: boolean): PromiseLike<Study[]>

  abstract getUserStudies (userId: string, testMode: boolean): PromiseLike<Study[]>

  abstract getStudyUsers (studyId: string): PromiseLike<User[]>

  abstract getAllStudies (): PromiseLike<Study[]>

  abstract createStudy (study: Study): PromiseLike<Study>

  abstract updateStudy (study: Study): PromiseLike<Study>

  abstract removeStudy (studyId: string): PromiseLike<void>
}
