import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

// Bottle interior path (slightly inset from outline for clipping)
const CLIP_PATH =
  'M 150,20 C 171,20 183,30 183,46 L 183,118 C 183,132 199,150 221,177 C 245,206 258,244 258,290 C 258,347 242,388 213,406 C 193,416 171,421 150,421 C 129,421 107,416 87,406 C 58,388 42,347 42,290 C 42,244 55,206 79,177 C 101,150 117,132 117,118 L 117,46 C 117,30 129,20 150,20 Z'

// Outer bottle outline path
const OUTLINE_PATH =
  'M 150,8 C 174,8 188,20 188,42 L 188,116 C 188,130 204,149 228,176 C 253,206 268,245 268,292 C 268,352 250,395 218,414 C 197,425 173,430 150,430 C 127,430 103,425 82,414 C 50,395 32,352 32,292 C 32,245 47,206 72,176 C 96,149 112,130 112,116 L 112,42 C 112,20 126,8 150,8 Z'

function useStars() {
  return useMemo(() => {
    const stars = []
    const count = 60

    for (let i = 0; i < count; i++) {
      // Distribute in body ellipse (center 150,295, rx~100, ry~112)
      // or neck (x 120-180, y 25-115)
      const inNeck = i < 9
      let x, y, attempts = 0
      do {
        if (inNeck) {
          x = 122 + Math.random() * 56
          y = 28 + Math.random() * 85
        } else {
          const angle = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random())
          x = 150 + r * 98 * Math.cos(angle)
          y = 295 + r * 108 * Math.sin(angle)
        }
        attempts++
      } while (attempts < 15 && (x < 44 || x > 256 || y > 418))

      const shapes = ['✦', '✧', '✦', '·', '✩', '✦', '✧', '★']
      const shape = shapes[i % shapes.length]

      const baseColors = [
        'rgba(255,230,110,1)',
        'rgba(255,255,190,0.95)',
        'rgba(255,200,70,1)',
        'rgba(255,245,160,0.9)',
        'rgba(255,175,55,1)',
        'rgba(255,255,255,0.85)',
      ]
      const color = baseColors[i % baseColors.length]

      const size = 5 + Math.random() * 14
      const delay = Math.random() * 4
      const duration = 1.4 + Math.random() * 1.8
      const repeatDelay = 0.3 + Math.random() * 2

      stars.push({ id: i, x, y, size, shape, color, delay, duration, repeatDelay })
    }
    return stars
  }, [])
}

export default function BottleEmpty() {
  const stars = useStars()

  return (
    <svg
      viewBox="0 0 300 460"
      style={{ height: '52vh', maxHeight: '60vh', width: 'auto', display: 'block', overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="bottle-clip-empty">
          <path d={CLIP_PATH} />
        </clipPath>

        {/* Warm interior radial glow */}
        <radialGradient id="interior-glow" cx="50%" cy="62%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,210,80,0.38)" />
          <stop offset="55%"  stopColor="rgba(255,140,30,0.18)" />
          <stop offset="100%" stopColor="rgba(120,60,0,0.04)" />
        </radialGradient>

        {/* Golden gradient for the bottle wall */}
        <linearGradient id="wall-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(170,105,10,0.92)" />
          <stop offset="12%"  stopColor="rgba(235,175,40,1)" />
          <stop offset="35%"  stopColor="rgba(255,240,160,0.7)" />
          <stop offset="50%"  stopColor="rgba(255,250,200,0.5)" />
          <stop offset="65%"  stopColor="rgba(255,230,120,0.7)" />
          <stop offset="88%"  stopColor="rgba(235,175,40,1)" />
          <stop offset="100%" stopColor="rgba(170,105,10,0.92)" />
        </linearGradient>

        {/* Glow filter for the outline */}
        <filter id="outline-glow" x="-15%" y="-8%" width="130%" height="116%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Subtle glow on stars */}
        <filter id="star-glow-inner" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Interior warm fill */}
      <path d={CLIP_PATH} fill="url(#interior-glow)" />

      {/* Twinkling stars clipped inside bottle */}
      <g clipPath="url(#bottle-clip-empty)" filter="url(#star-glow-inner)">
        {stars.map((s) => (
          <motion.text
            key={s.id}
            x={s.x}
            y={s.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={s.size}
            fill={s.color}
            animate={{ opacity: [0, 0.95, 0.8, 0.1, 0] }}
            transition={{
              delay: s.delay,
              duration: s.duration,
              repeat: Infinity,
              repeatDelay: s.repeatDelay,
              ease: 'easeInOut',
            }}
          >
            {s.shape}
          </motion.text>
        ))}
      </g>

      {/* Golden bottle outline */}
      <path
        d={OUTLINE_PATH}
        fill="none"
        stroke="url(#wall-grad)"
        strokeWidth="8"
        strokeLinejoin="round"
        filter="url(#outline-glow)"
      />

      {/* Left-side inner highlight */}
      <path
        d="M 132,38 C 127,62 120,95 120,118 C 120,135 110,152 95,172 C 78,196 64,228 60,264"
        fill="none"
        stroke="rgba(255,255,210,0.45)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Top rim highlight */}
      <ellipse cx="150" cy="14" rx="18" ry="5" fill="rgba(255,245,180,0.55)" />
    </svg>
  )
}
