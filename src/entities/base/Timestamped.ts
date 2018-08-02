import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export default abstract class Timestamped {
  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;
}
