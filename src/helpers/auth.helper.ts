import { AxiosError, AxiosResponse } from 'axios'
import { alert } from './log.helper'
import { i18n } from '@/i18n'

export function isNotAuthError (err: AxiosError | AxiosResponse): boolean {
  const isAuthError = err && ((err.response && err.response.status === 401) || err.status === 401)
  if (isAuthError) {
    alert('info', i18n.t('not_logged_in'), { unique: true })
  }
  return !isAuthError
}
