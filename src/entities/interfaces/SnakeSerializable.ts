export default interface SnakeSerializable {
  /**
   * Converts the object into a plain object that can be stringified
   * @returns {object}
   */
  toSnakeJSON (): object

  /**
   * Converts a JSON object into an instance of the class
   * @param json
   */
  fromSnakeJSON (json: any): this
}
