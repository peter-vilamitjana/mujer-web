'use client'

import React from 'react'

export function LiveClock() {
  const [time, setTime] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const update = () => setTime(new Date().toLocaleTimeString('es-AR',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) {
    return <div className="text-right h-[48px]"></div>
  }

  return (
    <div className="text-right">
      <p className="font-mono text-2xl text-[#f5f0e8] leading-none mb-1">{time}</p>
      <p className="text-[10px] text-[#7a766e]">
        {new Date().toLocaleDateString('es-AR',
          { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}
