import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";

@Entity("photo")
export default class Photo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn({ name: "id" }) @Serializable
  id: string;

  @Column({ name: "file_name" }) @Serializable
  fileName: string;
}
