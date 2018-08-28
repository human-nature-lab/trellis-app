import Study from '../entities/trellis/Study'
import Locale from '../entities/trellis/Locale'
declare const cordova: any

export class SearchDrawer {
  constructor (
    public component: any = null,
    public open: boolean = false
  ) {}
}

export class MenuDrawer {
  constructor (
    public open: boolean = false
  ) {}
}

export class Loading {
  constructor (
    public active: boolean = false,
    public step: number = 0,
    public steps: number = 0,
    public indeterminate: boolean = true,
    public message: string = '',
    public error: any = null
  ) {}
}

export class Singleton {
  constructor (
    public study: Study,
    public locale: Locale,
    public darkTheme: boolean,
    public offline: boolean = (typeof cordova === 'object'),
    public searchDrawer: SearchDrawer = new SearchDrawer(),
    public menuDrawer: MenuDrawer = new MenuDrawer(),
    public loading: Loading = new Loading(),
    public interview: object = {
      form: null,
      actions: null,
      data: null,
      conditionTags: null
    }
  ) {}
}

const singleton = new Singleton(
  null,
  null,
  false
)

export default singleton
