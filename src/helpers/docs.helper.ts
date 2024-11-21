import { ref } from 'vue'
import { setSecondaryDrawerIconForView } from './drawer.helper'

export const docsSidebarOpen = ref(false)
export const docsTocOpen = ref(false)
export const docsCurrentFile = ref('')

export function setDocsLink (link: string) {
  console.log('setting docs link', link)
  setSecondaryDrawerIconForView('mdi-help-circle-outline', () => {
    docsSidebarOpen.value = true
    docsCurrentFile.value = link
  })
}

export function normalizeDocsLink (to: string) {
  to = to.replace('/#/', '/')
  if (to.startsWith('./')) {
    to = to.substring(2)
  }
  if (to.startsWith('/documentation/')) {
    to = to.replace('/documentation/', '')
  }
  if (to.startsWith('/')) {
    to = to.substring(1)
  }
  if (to === '') {
    to = 'Home.md'
  }
  return to
}

export function openSidebarLink (to: string, isExternal?: boolean) {
  console.log('opening sidebar link', to)
  if (isExternal) {
    window.open(to, '_blank')
    return
  }
  docsSidebarOpen.value = true
  docsTocOpen.value = false
  docsCurrentFile.value = normalizeDocsLink(to)
}
