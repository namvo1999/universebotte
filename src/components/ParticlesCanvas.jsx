import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const randomBetween = (min, max) => min + Math.random() * (max - min)

const createStars = (count, width, height, color, sizeRange) => {
  const stars = []
  for(let i = 0; i < count; i++){
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: randomBetween(sizeRange[0], sizeRange[1]),
      color,
      baseAlpha: randomBetween(0.08, 0.28),
      phase: Math.random() * Math.PI * 2,
      speed: randomBetween(0.08, 0.18)
    })
  }
  return stars
}

const ParticlesCanvas = forwardRef(({seed, active=false}, ref)=>{
  const canvasRef = useRef(null)
  const stars = useRef([])
  const activeRef = useRef(active)
  const glow = useRef(0)

  useImperativeHandle(ref, ()=>({
    burst: () => { glow.current = 1 }
  }))

  useEffect(()=>{
    activeRef.current = active
  }, [active])

  useEffect(()=>{
    let running = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resetStars(){
      const width = window.innerWidth
      const height = window.innerHeight
      stars.current = [
        ...createStars(260, width, height, '255,255,255', [0.5, 1.4]),
        ...createStars(110, width, height, '200,215,255', [0.8, 2.2]),
        ...createStars(42, width, height, '225,230,255', [1.8, 3.8]),
      ]
    }

    function resize(){
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr,0,0,dpr,0,0)
      resetStars()
    }
    resize()
    window.addEventListener('resize', resize)

    let last = performance.now()
    function loop(t){
      if(!running) return
      const dt = (t-last)/1000
      last = t
      const width = window.innerWidth
      const height = window.innerHeight
      ctx.clearRect(0,0,canvas.width,canvas.height)

      const night = activeRef.current
      if(night){
        glow.current = Math.max(0, glow.current - dt * 0.4)
        ctx.fillStyle = `rgba(10,14,36,${0.08 + glow.current * 0.05})`
        ctx.fillRect(0,0,width,height)

        stars.current.forEach(star => {
          star.phase += dt * star.speed
          const alpha = star.baseAlpha + Math.sin(star.phase) * 0.12
          const starAlpha = Math.min(1, Math.max(0, alpha))
          const driftX = Math.sin(star.phase * 1.8) * 0.12
          const driftY = Math.cos(star.phase * 1.8) * 0.08
          ctx.beginPath()
          ctx.fillStyle = `rgba(${star.color},${starAlpha})`
          ctx.arc(star.x + driftX, star.y + driftY, star.size, 0, Math.PI * 2)
          ctx.fill()
        })

        if(glow.current > 0.02){
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.fillStyle = `rgba(255,230,180,${glow.current * 0.08})`
          ctx.beginPath()
          ctx.arc(width * 0.5, height * 0.35, width * 0.4, 0, Math.PI*2)
          ctx.fill()
          ctx.restore()
        }
      }
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
    return ()=>{ running = false; window.removeEventListener('resize', resize) }
  },[])

  useEffect(()=>{
    if(seed == null) return
    glow.current = 1
  }, [seed])

  return <canvas ref={canvasRef} style={{position:'absolute', inset:0, zIndex:10, pointerEvents:'none'}} />
})

export default ParticlesCanvas
