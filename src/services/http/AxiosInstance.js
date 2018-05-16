import axios from 'axios'
import config from '@/config'
let axiosInstance = null

// TODO: handle authentication using axios [interceptors](https://github.com/axios/axios#interceptors)
/**
 * Create the default axios instance. Any authentication for the web app should probably be handled here if possible
 * @returns {Promise<any>}
 */
export default function defaultInstance () {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: config.apiRoot + '/survey-view',
      timeout: 20000,
      headers: {'X-Key': config.xKey}
    })
  }
  return axiosInstance
}
