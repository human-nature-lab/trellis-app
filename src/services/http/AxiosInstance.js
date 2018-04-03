import axios from 'axios'
import config from '@/config'
let axiosInstance = null

// TODO: handle authentication using axios [interceptors](https://github.com/axios/axios#interceptors)
export default function defaultInstance () {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: config.apiRoot,
      timeout: 20000,
      headers: {'X-Key': config.xKey}
    })
  }
  return axiosInstance
}
