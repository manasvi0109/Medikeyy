"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  connections: number[]
}

type AnimatedBackgroundProps = {
  color?: string
  particleCount?: number
}

export default function AnimatedBackground({ color = "#3b82f6", particleCount = 50 }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>(0)
  const pathname = usePathname()
  const particlesRef = useRef(particles) // Move useRef here

  // Determine color based on current route
  const getColorByRoute = (): string => {
    if (pathname === "/") return "#3b82f6" // Dashboard - blue
    if (pathname === "/records") return "#14b8a6" // Records - teal
    if (pathname === "/analytics") return "#eab308" // Analytics - yellow
    if (pathname === "/family") return "#22c55e" // Family - green
    if (pathname === "/appointments") return "#ec4899" // Appointments - pink
    if (pathname === "/assistant") return "#f97316" // Assistant - orange
    if (pathname === "/emergency") return "#ef4444" // Emergency - red
    if (pathname === "/mobile-access") return "#3b82f6" // Mobile Access - blue
    if (pathname?.startsWith("/auth")) return "#f97316" // Auth - orange
    if (pathname === "/profile") return "#f97316" // Profile - orange
    return color
  }

  const currentColor = getColorByRoute()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          connections: [],
        })
      }
      setParticles(newParticles)
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || particles.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a ref to store particles data to avoid state updates during animation
    particlesRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles without updating state
      const currentParticles = particlesRef.current
      for (let i = 0; i < currentParticles.length; i++) {
        const p = currentParticles[i]

        // Update position
        p.x += p.speedX
        p.y += p.speedY

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${currentColor}${Math.floor(p.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Find and draw connections
        p.connections = []
        for (let j = i + 1; j < currentParticles.length; j++) {
          const p2 = currentParticles[j]
          const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2))

          if (distance < 100) {
            p.connections.push(j)

            // Draw connection
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const opacity = (1 - distance / 100) * 0.2
            ctx.strokeStyle = `${currentColor}${Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, "0")}`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [particles, currentColor])

  // Draw molecular structures
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawMolecule = (x: number, y: number, size: number) => {
      // Draw a simple molecular structure
      const atomRadius = size * 0.4
      const bondLength = size * 0.8

      // Central atom
      ctx.beginPath()
      ctx.arc(x, y, atomRadius, 0, Math.PI * 2)
      ctx.fillStyle = `${currentColor}30`
      ctx.fill()
      ctx.strokeStyle = `${currentColor}80`
      ctx.lineWidth = 1
      ctx.stroke()

      // Surrounding atoms
      const angles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3]
      angles.forEach((angle) => {
        const atomX = x + Math.cos(angle) * bondLength
        const atomY = y + Math.sin(angle) * bondLength

        // Draw bond
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(atomX, atomY)
        ctx.strokeStyle = `${currentColor}40`
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw atom
        ctx.beginPath()
        ctx.arc(atomX, atomY, atomRadius * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `${currentColor}20`
        ctx.fill()
        ctx.strokeStyle = `${currentColor}60`
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // Draw a few molecules
    const drawMolecules = () => {
      const numMolecules = 5
      for (let i = 0; i < numMolecules; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 30 + 20
        drawMolecule(x, y, size)
      }
    }

    drawMolecules()
  }, [currentColor])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30 dark:opacity-20"
    />
  )
}
