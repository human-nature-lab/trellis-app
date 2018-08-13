import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import FromJSON from "../interfaces/FromJSON";
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity("photo")
export default class Photo extends TimestampedSoftDelete implements FromJSON{
  @PrimaryGeneratedColumn({ name: "id" })
  id: string;

  @Column({ name: "file_name" })
  fileName: string;

  fromJSON (json: any) {
    mapPropsFromJSON(this, json, ['id', 'file_name', 'created_at', 'updated_at', 'deleted_at'])
    return this
  }
}
