import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export default abstract class Timestamped {
  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;
}
