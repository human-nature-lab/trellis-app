import {now} from '../services/DateService'
import SnakeCase from "./decorators/SnakeCase";
export default class Timestamped {
  @SnakeCase public updatedAt: Date = now();
  @SnakeCase public createdAt: Date = now();
  @SnakeCase public deletedAt: Date;
}
