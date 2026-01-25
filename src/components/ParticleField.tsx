import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

interface ParticleFieldProps {
  count?: number
  speed?: number
}

export function ParticleField({ count = 50, speed = 0.3 }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const dimensionsRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let isMounted = true
    let animationId: number

    const updateDimensions = () => {
      if (!isMounted || !canvas) return
      dimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      canvas.width = dimensionsRef.current.width
      canvas.height = dimensionsRef.current.height

      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * dimensionsRef.current.width,
        y: Math.random() * dimensionsRef.current.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      }))
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      if (!isMounted || !canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > dimensionsRef.current.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > dimensionsRef.current.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.fill()
      })

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distanceSq = dx * dx + dy * dy

          if (distanceSq < 22500) { // 150 * 150
            const distance = Math.sqrt(distanceSq)
            const opacity = (1 - distance / 150) * 0.15
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      isMounted = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [count, speed])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  )
}
