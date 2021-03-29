import StudyServiceAbstract from './StudyServiceAbstract'
import DatabaseService from '../database/DatabaseService'
import Study from '../../entities/trellis/Study'
import UserService from '../user/UserService'
import UserStudy from '../../entities/trellis/UserStudy'
import User from '../../entities/trellis/User'
import { IsNull } from 'typeorm'

class StudyServiceCordova extends StudyServiceAbstract {
  async getStudy (studyId: string): Promise<Study> {
    const repo = await DatabaseService.getRepository(Study)
    return repo.findOne({
      where: {
        id: studyId,
        deletedAt: IsNull()
      },
      relations: ['locales']
    })
  }

  async getUserStudies (userId: string): Promise<Study[]> {
    const repo = await DatabaseService.getRepository(Study)
    return repo.createQueryBuilder('study')
      .leftJoinAndSelect('study.locales', 'locale')
      .where(qb => 'study.id in ' + qb.subQuery()
        .select('user_study.studyId')
        .from(UserStudy, 'user_study')
        .where('user_study.userId = :userId', { userId })
        .getQuery()
      ).getMany()
  }
  
  async getStudyUsers (studyId: string): Promise<User[]> {
    const repo = await DatabaseService.getRepository(User)
    return repo.createQueryBuilder('user').
      where(qb => 'user.id in ' + qb.subQuery().
        select('user_study.userId').
        from(UserStudy, 'user_study').
        where('user_study.studyId = :studyId', { studyId }).
        getQuery()
      ).getMany()
  }

  async getMyStudies (): Promise<Study[]> {
    let user: User = await UserService.getCurrentUser()
    if (user.roleId === 'admin') {
      let repo = await DatabaseService.getRepository(Study)
      return repo.find({
        where: {
          deletedAt: IsNull()
        },
        relations: ['locales']
      })
    } else {
      return this.getUserStudies(user.id)
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

export default StudyServiceCordova
