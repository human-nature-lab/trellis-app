import { Column } from "typeorm";
import Timestamped from "./Timestamped"

export default abstract class TimestampedSoftDelete extends Timestamped {
  @Column({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt: Date = null;
}
