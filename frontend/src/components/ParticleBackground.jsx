import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Ambient specks in the new earthy palette
    const stars = Array.from({ length: 96 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.45 + 0.08,
      twinkleSpeed: Math.random() * 0.014 + 0.004,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.75
        ? '162,123,92'
        : Math.random() > 0.45
          ? '220,215,201'
          : '63,78,79',
    }))

    // Slow drifting dust particles
    const dust = Array.from({ length: 26 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 2 + 0.5,
      dx:    (Math.random() - 0.5) * 0.15,
      dy:    (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.12 + 0.03,
      color: Math.random() > 0.5 ? '162,123,92' : '220,215,201',
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      // Draw stars with twinkle
      stars.forEach(s => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.color},${a})`
        ctx.fill()
      })

      // Draw dust
      dust.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.9 }}
    />
  )
}
