import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const CLIP_PATH =
  'M 150,20 C 171,20 183,30 183,46 L 183,118 C 183,132 199,150 221,177 C 245,206 258,244 258,290 C 258,347 242,388 213,406 C 193,416 171,421 150,421 C 129,421 107,416 87,406 C 58,388 42,347 42,290 C 42,244 55,206 79,177 C 101,150 117,132 117,118 L 117,46 C 117,30 129,20 150,20 Z'

const OUTLINE_PATH =
  'M 150,8 C 174,8 188,20 188,42 L 188,116 C 188,130 204,149 228,176 C 253,206 268,245 268,292 C 268,352 250,395 218,414 C 197,425 173,430 150,430 C 127,430 103,425 82,414 C 50,395 32,352 32,292 C 32,245 47,206 72,176 C 96,149 112,130 112,116 L 112,42 C 112,20 126,8 150,8 Z'

// Liquid surface y-coordinate (~45% full from bottom)
const SURFACE_Y = 305

function useStars() {
  return useMemo(() => {
    const stars = []

    // Stars inside the liquid (below surface)
    for (let i = 0; i < 28; i++) {
      let x, y, attempts = 0
      do {
        const angle = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random())
        // Ellipse centered in liquid area (150, 362), rx=98, ry=52
        x = 150 + r * 98 * Math.cos(angle)
        y = 362 + r * 52 * Math.sin(angle)
        attempts++
      } while (attempts < 15 && (x < 44 || x > 256 || y < SURFACE_Y + 5 || y > 418))

      const shapes = ['✦', '✧', '✦', '★', '·', '✦']
      const colors = [
        'rgba(255,230,100,1)',
        'rgba(255,255,180,0.95)',
        'rgba(255,200,60,1)',
        'rgba(255,245,140,0.9)',
        'rgba(255,170,40,1)',
        'rgba(255,255,220,0.85)',
      ]
      stars.push({
        id: i,
        x, y,
        size: 4 + Math.random() * 12,
        shape: shapes[i % shapes.length],
        color: colors[i % colors.length],
        delay: Math.random() * 3.5,
        duration: 1.3 + Math.random() * 1.5,
        repeatDelay: 0.3 + Math.random() * 2,
        inLiquid: true,
      })
    }

    // A few stars floating above the liquid (sparse, dim)
    for (let i = 28; i < 36; i++) {
      let x, y, attempts = 0
      do {
        x = 125 + Math.random() * 50
        y = 140 + Math.random() * (SURFACE_Y - 150)
        attempts++
      } while (attempts < 10 && (x < 44 || x > 256))

      stars.push({
        id: i,
        x, y,
        size: 4 + Math.random() * 7,
        shape: ['✦', '·', '✧'][i % 3],
        color: 'rgba(255,230,140,0.55)',
        delay: Math.random() * 4,
        duration: 1.6 + Math.random() * 1.8,
        repeatDelay: 0.8 + Math.random() * 2.5,
        inLiquid: false,
      })
    }

    return stars
  }, [])
}

export default function BottleHalf() {
  const stars = useStars()

  return (
    <svg
      viewBox="0 0 300 460"
      style={{ height: '52vh', maxHeight: '60vh', width: 'auto', display: 'block', overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="bottle-clip-half">
          <path d={CLIP_PATH} />
        </clipPath>

        {/* Liquid gradient — amber at bottom, golden at surface */}
        <linearGradient id="liquid-grad-half" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(180,85,0,0.72)" />
          <stop offset="40%"  stopColor="rgba(235,140,15,0.62)" />
          <stop offset="80%"  stopColor="rgba(255,200,60,0.48)" />
          <stop offset="100%" stopColor="rgba(255,230,110,0.28)" />
        </linearGradient>

        {/* Ambient interior glow above liquid */}
        <radialGradient id="air-glow-half" cx="50%" cy="40%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,220,100,0.18)" />
          <stop offset="100%" stopColor="rgba(255,160,20,0.04)" />
        </radialGradient>

        {/* Bottle wall gradient */}
        <linearGradient id="wall-grad-half" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(170,105,10,0.92)" />
          <stop offset="12%"  stopColor="rgba(235,175,40,1)" />
          <stop offset="35%"  stopColor="rgba(255,240,160,0.7)" />
          <stop offset="50%"  stopColor="rgba(255,250,200,0.5)" />
          <stop offset="65%"  stopColor="rgba(255,230,120,0.7)" />
          <stop offset="88%"  stopColor="rgba(235,175,40,1)" />
          <stop offset="100%" stopColor="rgba(170,105,10,0.92)" />
        </linearGradient>

        <filter id="outline-glow-half" x="-15%" y="-8%" width="130%" height="116%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <filter id="star-glow-half" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <filter id="surface-glow" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ambient glow in empty space above liquid */}
      <path d={CLIP_PATH} fill="url(#air-glow-half)" />

      {/* Liquid fill + stars — all clipped to bottle */}
      <g clipPath="url(#bottle-clip-half)">
        {/* Liquid body */}
        <rect x="0" y={SURFACE_Y} width="300" height="150" fill="url(#liquid-grad-half)" />

        {/* Surface shimmer line */}
        <motion.path
          d={`M 44,${SURFACE_Y} C 90,${SURFACE_Y - 6} 120,${SURFACE_Y + 6} 150,${SURFACE_Y} C 180,${SURFACE_Y - 6} 220,${SURFACE_Y + 6} 256,${SURFACE_Y}`}
          fill={`rgba(255,240,140,0.35)`}
          stroke="rgba(255,240,150,0.75)"
          strokeWidth="2.5"
          filter="url(#surface-glow)"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Stars */}
        <g filter="url(#star-glow-half)">
          {stars.map((s) => (
            <motion.text
              key={s.id}
              x={s.x}
              y={s.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={s.size}
              fill={s.color}
              animate={{ opacity: [0, s.inLiquid ? 0.95 : 0.5, s.inLiquid ? 0.8 : 0.35, 0] }}
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
      </g>

      {/* Bottle outline */}
      <path
        d={OUTLINE_PATH}
        fill="none"
        stroke="url(#wall-grad-half)"
        strokeWidth="8"
        strokeLinejoin="round"
        filter="url(#outline-glow-half)"
      />

      {/* Glass highlight */}
      <path
        d="M 132,38 C 127,62 120,95 120,118 C 120,135 110,152 95,172 C 78,196 64,228 60,264"
        fill="none"
        stroke="rgba(255,255,210,0.45)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Top rim */}
      <ellipse cx="150" cy="14" rx="18" ry="5" fill="rgba(255,245,180,0.55)" />
    </svg>
  )
}
