// Interactive 3D Rotating Architectural Topiary & Garden Elevation Wireframe
export function initSpecsCanvas(canvas) {
  if (!canvas) return () => {}
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let angle = 0
  const targetSpeed = 0.008
  let hoverBoost = 0
  let rafId = 0

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.floor(canvas.clientWidth * dpr)
    const h = Math.floor(canvas.clientHeight * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }

  const onEnter = () => {
    hoverBoost = 0.018
  }
  const onLeave = () => {
    hoverBoost = 0
  }

  const parent = canvas.parentElement
  parent?.addEventListener('pointerenter', onEnter)
  parent?.addEventListener('pointerleave', onLeave)
  window.addEventListener('resize', resize, { passive: true })
  resize()

  // Sculpted garden topiary / hedge-crown silhouette rings
  const rings = [
    { y: -0.92, r: 0.44 }, // stone planter base
    { y: -0.78, r: 0.48 },
    { y: -0.62, r: 0.14 }, // pruned trunk
    { y: -0.18, r: 0.14 },
    { y: -0.02, r: 0.46 }, // lower sculpted tier
    { y: 0.24, r: 0.56 },
    { y: 0.52, r: 0.44 },
    { y: 0.76, r: 0.26 },
    { y: 0.94, r: 0.08 },  // precision apex
  ]

  const draw = () => {
    resize()
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    const strokeMain = isDark
      ? 'rgba(239, 243, 241, 0.26)'
      : 'rgba(17, 22, 20, 0.22)'
    const strokeAccent = isDark
      ? 'rgba(82, 122, 90, 0.9)'
      : 'rgba(61, 87, 64, 0.9)'

    const cx = w * 0.7
    const cy = h * 0.48
    const scaleY = Math.min(w, h) * 0.36
    const scaleX = scaleY * 0.85

    if (!prefersReduced) {
      angle += targetSpeed + hoverBoost
    }

    ctx.lineWidth = Math.max(1.2, w / 420)
    for (let i = 0; i < rings.length; i++) {
      const { y, r } = rings[i]
      ctx.beginPath()
      ctx.strokeStyle = i === 4 || i === 5 ? strokeAccent : strokeMain
      const rx = r * scaleX
      const ry = r * scaleX * 0.24
      const py = cy - y * scaleY
      ctx.ellipse(cx, py, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    const meridians = 12
    for (let m = 0; m < meridians; m++) {
      const theta = angle + (m * Math.PI * 2) / meridians
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)

      ctx.beginPath()
      ctx.strokeStyle = m % 3 === 0 ? strokeAccent : strokeMain
      for (let i = 0; i < rings.length; i++) {
        const { y, r } = rings[i]
        const px = cx + cosT * r * scaleX
        const py = cy - y * scaleY + sinT * r * scaleX * 0.24
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }

    if (!prefersReduced) {
      rafId = requestAnimationFrame(draw)
    }
  }

  rafId = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(rafId)
    parent?.removeEventListener('pointerenter', onEnter)
    parent?.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('resize', resize)
  }
}