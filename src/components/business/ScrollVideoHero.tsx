'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollVideoHeroProps {
  totalFrames: number
  framesPath: string
  frameExt?: string
  children?: React.ReactNode
}

export default function ScrollVideoHero({
  totalFrames,
  framesPath,
  frameExt = 'jpg',
  children,
}: ScrollVideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const rafRef = useRef<number>()
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const frameSrc = (i: number) =>
    `${framesPath}/frame-${String(i).padStart(4, '0')}.${frameExt}`

  const drawFrame = useCallback((index: number) => {
    if (!canvasRef.current || !framesRef.current[index]) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    const img = framesRef.current[index]
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.drawImage(img, 0, 0)
  }, [])

  // Precargar todos los frames en background
  useEffect(() => {
    const images: HTMLImageElement[] = []
    let loadedCount = 0

    for (let i = 1; i <= totalFrames; i++) {
      const img = new window.Image()
      img.src = frameSrc(i)

      img.onload = () => {
        loadedCount++
        setLoadProgress(Math.floor((loadedCount / totalFrames) * 100))
        
        // Configurar dimensiones iniciales del canvas y pintar el frame 0
        if (i === 1 && canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          drawFrame(0)
        }

        if (loadedCount === totalFrames) setIsLoaded(true)
      }

      images.push(img)
    }

    framesRef.current = images
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFrames, framesPath, frameExt, drawFrame])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const scrolled = -rect.top
        const scrollable = rect.height - window.innerHeight

        if (scrolled < 0 || scrolled > scrollable) return

        const progress = scrolled / scrollable
        const frameIndex = Math.min(
          Math.floor(progress * totalFrames),
          totalFrames - 1
        )

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex
          drawFrame(frameIndex)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [totalFrames, drawFrame])

  return (
    <div ref={containerRef} style={{ height: '500vh' }} className="relative">
      
      {/* Contenido flotante sobre el primer frame que hace scroll natural hacia arriba */}
      {children && (
        <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center z-10 pointer-events-none">
          {children}
        </div>
      )}

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#09090b]">
        {/* Loading bar */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#09090b]">
            <div className="w-48 h-px bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400/70 transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-zinc-600 text-[10px] mt-3 uppercase tracking-widest">
              {loadProgress}%
            </p>
          </div>
        )}

        {/* Frame display via Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{
            opacity: isLoaded ? 1 : 0.2,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold">
            Scroll
          </p>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent" />
        </div>
      </div>
    </div>
  )
}
