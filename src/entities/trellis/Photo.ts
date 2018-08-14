import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {mapCamelToPlain, mapPropsFromJSON} from "../../services/JSONUtil";

@Entity("photo")
export default class Photo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn({ name: "id" })
  id: string;

  @Column({ name: "file_name" })
  fileName: string;

  toSnakeJSON () {
    return mapCamelToPlain(this)
  }

  fromSnakeJSON (json: any) {
    mapPropsFromJSON(this, json, ['id', 'file_name', 'created_at', 'updated_at', 'deleted_at'])
    return this
  }
}
