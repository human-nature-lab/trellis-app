import { ref } from 'vue'

export const isFullscreen = ref(!!document.fullscreenElement)

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

export function toggleFullscreen (elem: HTMLElement) {
  if (document.fullscreenElement) {
    isFullscreen.value = false
    document.exitFullscreen()
  } else if (elem && elem.requestFullscreen) {
    isFullscreen.value = true
    elem.requestFullscreen()
  } else {
    console.error('fullscreen not supported')
  }
}

export function exitFullscreen () {
  document.exitFullscreen()
}
