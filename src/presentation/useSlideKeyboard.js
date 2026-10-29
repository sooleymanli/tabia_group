import { useEffect, useEffectEvent } from 'react'

const ISOLATED_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="dialog"]',
  '[data-keyboard-isolated]',
].join(',')

function isKeyboardIsolated(target) {
  return target instanceof Element && Boolean(target.closest(ISOLATED_SELECTOR))
}

export function useSlideKeyboard({
  onNext,
  onPrev,
  onFirst,
  onLast,
  onFullscreen,
}) {
  const handleKeyDown = useEffectEvent((event) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return
    if (isKeyboardIsolated(event.target)) return

    switch (event.key) {
      case 'ArrowRight':
      case 'PageDown':
        onNext()
        break
      case 'ArrowLeft':
      case 'PageUp':
        onPrev()
        break
      case 'Home':
        onFirst()
        break
      case 'End':
        onLast()
        break
      case 'f':
      case 'F':
        if (!onFullscreen) return
        onFullscreen()
        break
      default:
        return
    }
    event.preventDefault()
  })

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
