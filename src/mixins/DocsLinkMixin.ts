import { setDocsLink } from '@/helpers/docs.helper'
import { clearSecondaryDrawerIcon } from '@/helpers/drawer.helper'

export default function DocsLinkMixin (docLink: any) {
  return {
    beforeMount () {
      setDocsLink(docLink)
    },
    beforeUnmount () {
      clearSecondaryDrawerIcon()
    },
  }
}
