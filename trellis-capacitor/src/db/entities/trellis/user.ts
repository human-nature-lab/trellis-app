import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ nullable: true })
  birthday!: string

  @Column({ unique: true })
  email!: string
}
