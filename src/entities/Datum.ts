import Timestamped from "./Timestamped"
import uuidv4 from 'uuid/v4'
import SnakeCase from "./decorators/SnakeCase";

export default class Datum extends Timestamped {
  @SnakeCase public choiceId: string;
  @SnakeCase public datumTypeId: string = '0';
  @SnakeCase public edgeId: string;
  @SnakeCase public eventOrder: number;
  @SnakeCase public geoId: string;
  @SnakeCase public id: string = uuidv4();
  @SnakeCase public name: string;
  @SnakeCase public photoId: string;
  @SnakeCase public questionDatumId: string;
  @SnakeCase public rosterId: string;
  @SnakeCase public sortOrder: number;
  @SnakeCase public surveyId: string;
  @SnakeCase public val: string;
}
