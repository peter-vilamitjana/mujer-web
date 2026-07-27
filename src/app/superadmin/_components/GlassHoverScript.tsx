'use client'

import { useEffect } from 'react'

export function GlassHoverScript() {
  useEffect(() => {
    function attach(el: HTMLElement) {
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(239,68,68,0.07) 0%, rgba(13,13,13,0.65) 65%)`
      })
      el.addEventListener('mouseleave', () => {
        el.style.background = ''
      })
    }

    document.querySelectorAll<HTMLElement>('.glass-hover').forEach(attach)

    const observer = new MutationObserver(mutations => {
      mutations.forEach(m =>
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          if (node.classList.contains('glass-hover')) attach(node)
          node.querySelectorAll<HTMLElement>('.glass-hover').forEach(attach)
        })
      )
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
