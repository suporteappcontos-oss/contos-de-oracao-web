'use client'

import React, { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}

export default function RibbonCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // Esconde em dispositivos de toque (celulares/tablets) para não prejudicar a experiência
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Configuração das fitas (Ribbons)
    const numPoints = 25
    const ribbonCount = 2

    // Arrays de pontos para cada fita
    const ribbons: Point[][] = Array.from({ length: ribbonCount }, () =>
      Array.from({ length: numPoints }, () => ({ x: width / 2, y: height / 2 }))
    )

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, isHovered: false }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.isHovered = true
    }

    const handleMouseLeave = () => {
      mouse.isHovered = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Efeito de renderização contínua a 60FPS
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Lerp para suavizar o movimento do mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.25
      mouse.y += (mouse.targetY - mouse.y) * 0.25

      ribbons.forEach((points, ribbonIdx) => {
        // O líder segue o cursor com um leve deslocamento (offset) entre as duas fitas
        const offsetMultiplier = ribbonIdx === 0 ? 1 : -1
        const leadTargetX = mouse.x + offsetMultiplier * 4
        const leadTargetY = mouse.y + offsetMultiplier * 4

        points[0].x += (leadTargetX - points[0].x) * 0.4
        points[0].y += (leadTargetY - points[0].y) * 0.4

        // Cada ponto da fita segue o ponto anterior com suavidade (Spring/Lerp Physics)
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1]
          const curr = points[i]
          const speed = 0.35 - (i / numPoints) * 0.15

          curr.x += (prev.x - curr.x) * speed
          curr.y += (prev.y - curr.y) * speed
        }

        // Desenha a fita usando curvas quadráticas com degradê dourado premium
        if (points.length > 2 && mouse.isHovered) {
          ctx.beginPath()
          ctx.moveTo(points[0].x, points[0].y)

          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2
            const yc = (points[i].y + points[i + 1].y) / 2
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
          }

          // Gradiente Dourado Contos de Oração (#FFD700 -> #D4AF37 -> Transparente)
          const grad = ctx.createLinearGradient(
            points[0].x,
            points[0].y,
            points[points.length - 1].x,
            points[points.length - 1].y
          )

          if (ribbonIdx === 0) {
            grad.addColorStop(0, 'rgba(255, 215, 0, 0.85)')   // Ouro Brilhante na ponta
            grad.addColorStop(0.4, 'rgba(212, 175, 55, 0.5)')  // Dourado Nobre no meio
            grad.addColorStop(1, 'rgba(212, 175, 55, 0)')     // Suave esvanecimento no rastro
          } else {
            grad.addColorStop(0, 'rgba(248, 250, 252, 0.6)')  // Fita secundária branca translúcida
            grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.35)') // Transição para ouro
            grad.addColorStop(1, 'rgba(212, 175, 55, 0)')
          }

          ctx.strokeStyle = grad
          ctx.lineWidth = ribbonIdx === 0 ? 2.5 : 1.5
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          // Efeito de brilho suave (Glow Effect)
          ctx.shadowBlur = 8
          ctx.shadowColor = ribbonIdx === 0 ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.3)'

          ctx.stroke()
          ctx.shadowBlur = 0 // reseta glow para economizar renderização
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ pointerEvents: 'none' }}
    />
  )
}
