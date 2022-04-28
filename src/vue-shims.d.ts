declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.md' {
  import { ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}
