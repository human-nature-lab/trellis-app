import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Role from './Role'
import UserStudy from "./UserStudy";
import Study from "./Study";

@Entity()
export default class User extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  username: string
  @Column() @Serializable
  password: string

  @Column({ nullable: true }) @Serializable
  roleId: string
  @Column({ nullable: true }) @Serializable
  selectedStudyId: string

  @Relationship(type => Role)
  @OneToOne(type => Role)
  role: Role

  @Relationship({generator: userStudyTransformer})
  @OneToMany(type => UserStudy, userStudy => userStudy.user)
  studies: UserStudy[]

  fromSnakeJSON (u: any): this {
    this.studies = []
    return super.fromSnakeJSON(u)
  }
}

function userStudyTransformer (u) {
  const userStudy = new UserStudy().fromSnakeJSON(u.pivot)
  userStudy.study = new Study().fromSnakeJSON(u)
  return userStudy
}
