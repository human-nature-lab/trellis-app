import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'

@Entity("updated_records")
export default class UpdatedRecords {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string;

  @Column({ name: "updated_record_id" }) @Serializable
  updatedRecordId: string;

  @Column({ name: "table" }) @Serializable
  table: string;

  @Column({ name: "is_insert", nullable: false, 'default': false }) @Serializable
  isInsert: boolean;

  @Column({ name: "is_update", nullable: false, 'default': false }) @Serializable
  isUpdate: boolean;

  @Column({ name: "is_remove", nullable: false, 'default': false }) @Serializable
  isRemove: boolean;

  @Column({ name: "uploaded_at", nullable: true, 'default': null }) @Serializable
  uploadedAt: Date;
}
