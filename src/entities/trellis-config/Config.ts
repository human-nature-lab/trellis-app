import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("config")
export default class Config {
  @PrimaryColumn({ name: "name" })
  name: string;

  @Column({ name: "val" })
  val: string;
}
