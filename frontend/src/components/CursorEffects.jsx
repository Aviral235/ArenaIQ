import { useEffect, useRef, useCallback } from 'react'

/*
  CursorEffects — global cursor interaction layer
  • Glow orb follows cursor (requestAnimationFrame)
  • Ripple on click
  • Disabled on mobile/touch devices
*/

export default function CursorEffects() {
  const glowRef = useRef(null)
  const rippleContainerRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const rafId = useRef(null)

  /* ─── Smooth glow follower via rAF ─── */
  const animate = useCallback(() => {
    const lerp = 0.12
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${currentPos.current.x - 100}px, ${currentPos.current.y - 100}px)`
    }
    rafId.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    // Disable on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const handleMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleClick = (e) => {
      createRipple(e.clientX, e.clientY)
    }

    /* ─── Magnetic effect for glass buttons ─── */
    const handleBtnMove = (e) => {
      const btn = e.target.closest('.glass-btn, .glass-btn-primary')
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * 0.12
      const dy = (e.clientY - cy) * 0.12
      const maxShift = 8
      const clampedX = Math.max(-maxShift, Math.min(maxShift, dx))
      const clampedY = Math.max(-maxShift, Math.min(maxShift, dy))
      btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`
    }

    const handleBtnLeave = (e) => {
      const btn = e.target.closest('.glass-btn, .glass-btn-primary')
      if (btn) btn.style.transform = ''
    }

    document.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleBtnMove, { passive: true })
    document.addEventListener('mouseleave', handleBtnLeave, true)
    document.addEventListener('mouseout', handleBtnLeave, true)

    rafId.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleBtnMove)
      document.removeEventListener('mouseleave', handleBtnLeave, true)
      document.removeEventListener('mouseout', handleBtnLeave, true)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [animate])

  /* ─── Ripple creation ─── */
  const createRipple = (x, y) => {
    if (!rippleContainerRef.current) return
    const ripple = document.createElement('div')
    ripple.className = 'cursor-ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    rippleContainerRef.current.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      {/* Glow orb */}
      <div ref={glowRef} style={{
        position: 'fixed', top: 0, left: 0, width: '200px', height: '200px',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 9998,
        background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, rgba(0,206,201,0.04) 40%, transparent 70%)',
        mixBlendMode: 'screen',
        transform: 'translate(-100px, -100px)',
        willChange: 'transform',
      }} />
      {/* Ripple container */}
      <div ref={rippleContainerRef} style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997, overflow: 'hidden',
      }} />
    </>
  )
}
