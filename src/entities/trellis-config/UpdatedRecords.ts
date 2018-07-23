import {PrimaryColumn, Entity, Column} from "typeorm";

@Entity("updated_records")
export default class UpdatedRecords {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({ name: "updated_record_id" })
  updatedRecordId: string;

  @Column({ name: "is_update" })
  isUpdate: boolean;

  @Column({ name: "uploaded_at" })
  uploadedAt: Date;
}
