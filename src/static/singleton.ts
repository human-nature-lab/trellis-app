import Study from '../entities/trellis/Study'
import Locale from '../entities/trellis/Locale'
import User from '../entities/trellis/User'
import storage from '../services/StorageService'
import Action from "../entities/trellis/Action";
import Form from "../entities/trellis/Form";
declare const cordova: any

export interface SearchDrawer {
  component: any
  open: boolean
}

export class MenuDrawer {
  constructor (
    public open: boolean = false
  ) {}
}

export interface Loading {
  active: boolean
  step: number
  steps: number
  indeterminate: boolean
  message: string
  error: any
}

export interface Singleton {
  study: Study
  locale: Locale
  deviceId: string
  darkTheme: boolean
  user: User
  offline: boolean
  searchDrawer: SearchDrawer
  menuDrawer: MenuDrawer
  loading: Loading
  interview: {
    form: Form,
    actions: Action[],
    data: any,
    conditionTags: any
  }
}

export default {
  study: null,
  locale: null,
  darkTheme: false,
  deviceId: null,
  user: null,
  offline: storage.get('offline') !== null ? storage.get('offline') : (typeof cordova === 'object'),
  searchDrawer: {
    component: null,
    open: false
  } as SearchDrawer,
  menuDrawer: {
    open: false
  } as MenuDrawer,
  loading: {
    active: false,
    step: 0,
    steps: 0,
    indeterminate: true,
    message: '',
    error: null
  } as Loading,
  interview: {
    form: null,
    actions: null,
    data: null,
    conditionTags: null
  }
} as Singleton
