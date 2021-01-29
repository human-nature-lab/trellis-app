export default interface LoginServiceInterface {
  
  
  /**
   * Request login credentials to the application
   * @returns {Promise<{ password: string, username: string}>}
   * @memberof LoginServiceInterface
   */
  requestLogin (): Promise<{ password: string, username: string}>

  /**
   * Login to the web app
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  login(username: string, password: string): Promise<any>

  /**
   * Return a boolean indicating if the user is logged in. This should be present in memory or determined
   * synchronously
   * @returns {Promise<boolean>}
   */
  isLoggedIn(): Promise<boolean>

  /**
   * Logout of application
   * @returns {Promise<any>}
   */
  logout(): Promise<any>

}
