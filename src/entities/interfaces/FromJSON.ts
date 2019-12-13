export default interface FromJSON {
  /**
   * Recursively converts a JSON structure into its entities. Including any typeorm relationships. Primarly used for the
   * web interface
   * @param {object} json
   */
  fromSnakeJSON (json: object): this
}
