import Study from '../entities/trellis/Study'
import Locale from '../entities/trellis/Locale'
interface Singleton {
  study: Study|null;
  locale: Locale|null;
  darkTheme: boolean;
  searchDrawer: object;
  menuDrawer: object;
  loading: object;
  interview: object;
}

const singleton: Singleton = {
  study: null,
  locale: null,
  darkTheme: false,
  searchDrawer: {
    component: null,
    open: false
  },
  menuDrawer: {
    open: false
  },
  loading: {
    active: false,
    step: 0,
    steps: 0,
    indeterminate: true,
    message: '',
    error: null
  },
  interview: {
    form: null,
    actions: null,
    data: null,
    conditionTags: null
  }
}

export default singleton
