import { setSecondaryDrawerIcon } from './drawer.helper'
import bus, { DocsEventTypes } from '@/components/documentation/DocsEventBus'

export function setDocsLink (link: string) {
  console.log('setting docs link', link)
  setSecondaryDrawerIcon('mdi-help-circle-outline', () => {
    bus.$emit(DocsEventTypes.open, link)
  })
}
