import { Column } from "typeorm";

export abstract class SoftDelete {
  @Column({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt: Date;
}
