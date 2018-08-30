import {PrimaryColumn, Entity, Column} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'

@Entity("updated_records")
export default class UpdatedRecords {
  @PrimaryColumn({ name: "id" }) @Serializable
  id: string;

  @Column({ name: "updated_record_id" }) @Serializable
  updatedRecordId: string;

  @Column({ name: "is_update" }) @Serializable
  isUpdate: boolean;

  @Column({ name: "uploaded_at" }) @Serializable
  uploadedAt: Date;
}
