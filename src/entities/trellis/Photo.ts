import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import TimestampedSoftDelete from "./TimestampedSoftDelete";

@Entity("photo")
export default class Photo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn({ name: "uuid" })
  id: string;

  @Column({ name: "file_name" })
  fileName: string;
}
