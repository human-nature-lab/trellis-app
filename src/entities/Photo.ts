import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import Timestamped from "./Timestamped";
import SoftDelete from "./SoftDelete";

@Entity("photo")
export class Photo extends Timestamped, SoftDelete {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "file_name" })
  fileName: string;
}
