import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const CLIP_PATH =
  'M 150,20 C 171,20 183,30 183,46 L 183,118 C 183,132 199,150 221,177 C 245,206 258,244 258,290 C 258,347 242,388 213,406 C 193,416 171,421 150,421 C 129,421 107,416 87,406 C 58,388 42,347 42,290 C 42,244 55,206 79,177 C 101,150 117,132 117,118 L 117,46 C 117,30 129,20 150,20 Z'

const OUTLINE_PATH =
  'M 150,8 C 174,8 188,20 188,42 L 188,116 C 188,130 204,149 228,176 C 253,206 268,245 268,292 C 268,352 250,395 218,414 C 197,425 173,430 150,430 C 127,430 103,425 82,414 C 50,395 32,352 32,292 C 32,245 47,206 72,176 C 96,149 112,130 112,116 L 112,42 C 112,20 126,8 150,8 Z'

function useStars() {
  return useMemo(() => {
    const count = 60
    return Array.from({ length: count }, (_, i) => {
      // Distribute throughout entire interior: body + neck
      const inNeck = i < 10
      let x, y, attempts = 0
      do {
        if (inNeck) {
          x = 122 + Math.random() * 56
          y = 25 + Math.random() * 90
        } else {
          const angle = Math.random() * Math.PI * 2
          const r = Math.sqrt(Math.random())
          x = 150 + r * 100 * Math.cos(angle)
          y = 295 + r * 110 * Math.sin(angle)
        }
        attempts++
      } while (attempts < 15 && (x < 44 || x > 256 || y > 418))

      const shapes = ['✦', '✧', '★', '✩', '✦', '·', '✦', '✧', '★']
      // Brighter, more varied colors including whites and pinks for "magical full" state
      const colors = [
        'rgba(255,240,110,1)',
        'rgba(255,255,200,1)',
        'rgba(255,210,60,1)',
        'rgba(255,250,160,0.95)',
        'rgba(255,180,50,1)',
        'rgba(255,255,255,0.9)',
        'rgba(255,200,230,0.9)',
        'rgba(220,200,255,0.85)',
      ]

      return {
        id: i,
        x, y,
        size: 6 + Math.random() * 16,
        shape: shapes[i % shapes.length],
        color: colors[i % colors.length],
        delay: Math.random() * 3,
        duration: 1.2 + Math.random() * 1.6,
        repeatDelay: 0.1 + Math.random() * 1.2,
      }
    })
  }, [])
}

export default function BottleFull() {
  const stars = useStars()

  return (
    <svg
      viewBox="0 0 300 460"
      style={{ height: '52vh', maxHeight: '60vh', width: 'auto', display: 'block', overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="bottle-clip-full">
          <path d={CLIP_PATH} />
        </clipPath>

        {/* Full liquid gradient — deep amber bottom → bright gold → near-white glow at top */}
        <linearGradient id="liquid-grad-full" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(160,75,0,0.8)" />
          <stop offset="25%"  stopColor="rgba(220,130,10,0.7)" />
          <stop offset="55%"  stopColor="rgba(255,195,45,0.6)" />
          <stop offset="80%"  stopColor="rgba(255,235,100,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,200,0.4)" />
        </linearGradient>

        {/* Bright core glow */}
        <radialGradient id="core-glow-full" cx="50%" cy="55%" r="48%">
          <stop offset="0%"   stopColor="rgba(255,230,100,0.55)" />
          <stop offset="50%"  stopColor="rgba(255,160,30,0.3)" />
          <stop offset="100%" stopColor="rgba(180,80,0,0.05)" />
        </radialGradient>

        {/* Bottle wall — brighter/more intense for full state */}
        <linearGradient id="wall-grad-full" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(200,130,10,0.95)" />
          <stop offset="12%"  stopColor="rgba(255,200,50,1)" />
          <stop offset="35%"  stopColor="rgba(255,250,180,0.75)" />
          <stop offset="50%"  stopColor="rgba(255,255,220,0.6)" />
          <stop offset="65%"  stopColor="rgba(255,240,130,0.75)" />
          <stop offset="88%"  stopColor="rgba(255,200,50,1)" />
          <stop offset="100%" stopColor="rgba(200,130,10,0.95)" />
        </linearGradient>

        {/* Stronger outer glow for full bottle */}
        <filter id="outline-glow-full" x="-22%" y="-12%" width="144%" height="124%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <filter id="star-glow-full" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Overflow halo at rim */}
        <filter id="rim-overflow" x="-40%" y="-200%" width="180%" height="600%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Full liquid fill */}
      <g clipPath="url(#bottle-clip-full)">
        <rect x="0" y="0" width="300" height="460" fill="url(#liquid-grad-full)" />
        {/* Core radial glow */}
        <ellipse cx="150" cy="295" rx="115" ry="125" fill="url(#core-glow-full)" />
      </g>

      {/* Stars — clipped, glowing, throughout entire interior */}
      <g clipPath="url(#bottle-clip-full)" filter="url(#star-glow-full)">
        {stars.map((s) => (
          <motion.text
            key={s.id}
            x={s.x}
            y={s.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={s.size}
            fill={s.color}
            animate={{ opacity: [0, 1, 0.85, 0] }}
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

      {/* Bottle outline — brighter than other states */}
      <path
        d={OUTLINE_PATH}
        fill="none"
        stroke="url(#wall-grad-full)"
        strokeWidth="9"
        strokeLinejoin="round"
        filter="url(#outline-glow-full)"
      />

      {/* Glass highlight */}
      <path
        d="M 132,38 C 127,62 120,95 120,118 C 120,135 110,152 95,172 C 78,196 64,228 60,264"
        fill="none"
        stroke="rgba(255,255,230,0.55)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Overflow glow at rim — pulsing */}
      <motion.ellipse
        cx="150"
        cy="10"
        rx="22"
        ry="8"
        fill="rgba(255,240,130,0.7)"
        filter="url(#rim-overflow)"
        animate={{ opacity: [0.5, 1, 0.5], ry: [8, 12, 8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top rim */}
      <ellipse cx="150" cy="10" rx="19" ry="6" fill="rgba(255,250,190,0.65)" />
    </svg>
  )
}
