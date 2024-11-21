import { onMounted, onBeforeUnmount, ref } from 'vue'

export const secondaryDrawerIcon = ref<string>()
export const secondaryDrawerOnClick = ref<() => void>()
export const secondaryDrawerTooltip = ref<string>()

export function setSecondaryDrawerIcon (icon: string, onClick: () => void, tooltip?: string) {
  console.log('set secondary drawer icon', icon)
  secondaryDrawerIcon.value = icon
  secondaryDrawerOnClick.value = onClick
  secondaryDrawerTooltip.value = tooltip
}

export function clearSecondaryDrawerIcon () {
  console.log('clear secondary drawer icon')
  secondaryDrawerIcon.value = null
  secondaryDrawerOnClick.value = null
  secondaryDrawerTooltip.value = null
}

export function setSecondaryDrawerIconForView (icon: string, onClick: () => void, tooltip?: string) {
  onMounted(() => {
    setSecondaryDrawerIcon(icon, onClick, tooltip)
  })
  onBeforeUnmount(() => {
    clearSecondaryDrawerIcon()
  })
}
