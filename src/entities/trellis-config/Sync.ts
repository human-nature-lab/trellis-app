import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("sync")
export default class Sync {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({ name: "type" })
  type: string;

  @Column({ name: "status" })
  status: string;

  @Column({ name: "device_id" })
  deviceId: string;

  @Column({ name: "file_name" })
  fileName: string;

  @Column({ name: "created_at" })
  createdAt: Date;
}

/* TODO:
relations: {
  messages: {
    target: 'Message',
      type: 'many-to-many',
      joinTable: true,
      cascade: true
  }
}
*/
