import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

export const secondaryDrawerIcon = ref<string>()
export const secondaryDrawerOnClick = ref<() => void>()

export function setSecondaryDrawerIcon (icon: string, onClick: () => void) {
  console.log('set secondary drawer icon', icon)
  secondaryDrawerIcon.value = icon
  secondaryDrawerOnClick.value = onClick
}

export function clearSecondaryDrawerIcon () {
  console.log('clear secondary drawer icon')
  secondaryDrawerIcon.value = null
  secondaryDrawerOnClick.value = null
}

export function setSecondaryDrawerIconForView (icon: string, onClick: () => void) {
  onBeforeMount(() => {
    setSecondaryDrawerIcon(icon, onClick)
  })
  onBeforeUnmount(() => {
    clearSecondaryDrawerIcon()
  })
}
