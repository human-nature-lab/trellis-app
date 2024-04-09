import { StudyServiceAbstract } from './StudyServiceAbstract'
import DatabaseService from '../database'
import Study from '../../entities/trellis/Study'
import UserService from '../user'
import UserStudy from '../../entities/trellis/UserStudy'
import User from '../../entities/trellis/User'
import { IsNull, Not } from 'typeorm'

export class StudyService extends StudyServiceAbstract {
  async getStudy (studyId: string): Promise<Study> {
    const repo = await DatabaseService.getRepository(Study)
    return repo.findOne({
      where: {
        id: studyId,
        deletedAt: IsNull(),
      },
      relations: ['locales', 'testStudy'],
    })
  }

  async getProdStudyFromTest (studyId: string): Promise<Study> {
    const repo = await DatabaseService.getRepository(Study)
    return repo.findOne({
      where: {
        testStudyId: studyId,
        deletedAt: IsNull(),
      },
      relations: ['locales', 'testStudy'],
    })
  }

  async getUserStudies (userId: string, testMode: boolean): Promise<Study[]> {
    const repo = await DatabaseService.getRepository(Study)
    let q = repo.createQueryBuilder('study')
      .leftJoinAndSelect('study.locales', 'locale')
      .leftJoinAndSelect('study.testStudy', 'testStudy')
      .where(qb => 'study.id in ' + qb.subQuery()
        .select('user_study.study_id')
        .from(UserStudy, 'user_study')
        .where('user_study.user_id = :userId', { userId })
        .getQuery(),
      )
      .andWhere('study.deleted_at is null')
    if (!testMode) {
      q = q.andWhere('study.test_study_id is not null')
    }
    const studies = await q.getMany()
    if (testMode) {
      return studies.map(s => s.testStudy)
    }
    return studies
  }

  async getStudyUsers (studyId: string): Promise<User[]> {
    const repo = await DatabaseService.getRepository(User)
    return repo.createQueryBuilder('user')
      .where(qb => 'user.id in ' + qb.subQuery()
        .select('user_study.userId')
        .from(UserStudy, 'user_study')
        .where('user_study.studyId = :studyId', { studyId })
        .getQuery(),
      ).getMany()
  }

  async getMyStudies (testMode: boolean): Promise<Study[]> {
    const user: User = await UserService.getCurrentUser()
    if (user.roleId === 'admin') {
      const repo = await DatabaseService.getRepository(Study)
      const studies = await repo.find({
        where: {
          deletedAt: IsNull(),
          testStudyId: Not(IsNull()),
        },
        relations: ['locales', 'testStudy'],
      })
      if (testMode) {
        return studies.map(s => s.testStudy)
      }
      return studies
    } else {
      return this.getUserStudies(user.id, testMode)
    }
  }

  async getAllStudies (): Promise<Study[]> {
    throw Error('Not implemented')
  }

  createStudy (study: Study): Promise<Study> {
    throw new Error('Not implemented')
  }

  updateStudy (study: Study): Promise<Study> {
    throw new Error('Not implemented')
  }

  removeStudy (studyId: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
