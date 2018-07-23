import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("message")
export default class Message {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({ name: "message" })
  message: string;

  @Column({ name: "type" })
  type: string;

  @Column({ name: "created_at" })
  createdAt: Date;
}
