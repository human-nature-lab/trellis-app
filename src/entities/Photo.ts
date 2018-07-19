import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import TimestampedSoftDelete from "./TimestampedSoftDelete";

@Entity("photo")
export class Photo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "file_name" })
  fileName: string;
}
