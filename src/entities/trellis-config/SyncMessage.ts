import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("sync_message")
export default class SyncMessage {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({ name: "sync_id" })
  syncId: string;

  @Column({ name: "message_id" })
  messageId: string;
}
