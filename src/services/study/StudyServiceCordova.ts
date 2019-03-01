import StudyServiceAbstract from './StudyServiceAbstract'
import DatabaseService from '../database/DatabaseService'
import Study from '../../entities/trellis/Study'
import UserService from '../user/UserService'
import UserStudy from "../../entities/trellis/UserStudy";
import User from "../../entities/trellis/User";
import {IsNull} from 'typeorm'

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
    return await repo.createQueryBuilder('study')
      .leftJoinAndSelect('study.locales', 'locale')
      .where(qb => 'study.id in ' + qb.subQuery()
        .select('user_study.studyId')
        .from(UserStudy, 'user_study')
        .where('user_study.userId = :userId', {userId})
        .getQuery()
      ).getMany()
  }

  async getMyStudies (): Promise<Study[]> {
    let user: User = UserService.getCurrentUser()
    if (user.role.toLowerCase() === 'admin') {
      let repo = await DatabaseService.getRepository(Study)
      return await repo.find({
        where: {
          deletedAt: IsNull()
        },
        relations: ['locales']
      })
    } else {
      return await this.getUserStudies(user.id)
    }
  }

  async getAllStudies (): Promise<Study[]> {
    throw Error('Not implemented')
  }
}

export default StudyServiceCordova
