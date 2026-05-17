import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import BottleEmpty from './BottleEmpty'
import BottleHalf from './BottleHalf'
import BottleFull from './BottleFull'

// Sparkle counts and sizes per message level
const SPARKLE_CONFIG = [
  { count: 18,  shapes: ['✦','✧','·','✦'], colors: ['rgba(255,220,180,0.9)','rgba(255,240,200,0.85)','rgba(255,255,255,0.8)'] },
  { count: 30, shapes: ['✦','✧','★','·','✦','✩'], colors: ['rgba(255,200,120,0.95)','rgba(255,240,180,0.9)','rgba(255,255,210,0.85)','rgba(255,180,220,0.8)'] },
  { count: 46, shapes: ['✦','✧','★','✩','✦','·','✦','✧'], colors: ['rgba(255,180,80,1)','rgba(255,220,120,0.95)','rgba(255,255,180,0.9)','rgba(255,160,220,0.88)','rgba(200,180,255,0.85)'] },
]

function useSparkles(messageCount) {
  return useMemo(() => {
    const level = messageCount >= 3 ? 2 : messageCount >= 1 ? 1 : 0
    const cfg = SPARKLE_CONFIG[level]
    return Array.from({ length: cfg.count }, (_, i) => {
      const angle = (i / cfg.count) * 360 + Math.random() * (360 / cfg.count)
      const dist = 22 + Math.random() * 44
      const rad = (angle * Math.PI) / 180
      const x = 50 + dist * Math.cos(rad)
      const y = 50 + dist * Math.sin(rad)
      const size = 10 + Math.random() * (10 + level * 5)
      const shape = cfg.shapes[i % cfg.shapes.length]
      const color = cfg.colors[i % cfg.colors.length]
      const delay = Math.random() * 2.4
      const duration = 1.2 + Math.random() * 1.2
      const repeatDelay = 0.1 + Math.random() * 0.8
      const driftY = 8 + Math.random() * 16
      const driftRotate = (Math.random() - 0.5) * 60
      return { id: i, x, y, size, shape, color, delay, duration, repeatDelay, driftY, driftRotate }
    })
  }, [messageCount])
}

export default function Bottle({ className = '', onInteract = () => {}, active = false, messageCount = 0 }) {
  const [hovering, setHovering] = useState(false)
  const sparkles = useSparkles(messageCount)

  const handleClick = () => {
    if (active) onInteract()
  }

  return (
    <motion.button
      type="button"
      data-message-count={messageCount}
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      whileHover={active ? { scale: 1.04 } : { scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`relative inline-flex items-center justify-center ${className} focus:outline-none`}
    >
      <div className={`absolute inset-0 rounded-full ${active ? 'bottle-active-glow' : 'bottle-soft-glow'}`} />
      <motion.div
        className="relative z-10 overflow-visible"
        animate={{ y: [0, -10, 0], scale: [1, 1.008, 1] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
      >
        {messageCount >= 5 ? (
          <BottleFull />
        ) : messageCount >= 1 ? (
          <BottleHalf />
        ) : (
          <BottleEmpty />
        )}
        <div className="pointer-events-none absolute inset-x-14 top-6 h-24 rounded-full bg-white/20 blur-3xl opacity-70" />
      </motion.div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,216,175,0.18),transparent_50%)] blur-[42px]" />
      </div>
      {/* Always-on glow, intensifies on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ opacity: hovering ? 1 : 0.45 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="rounded-full absolute"
          style={{
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: messageCount >= 3
              ? 'radial-gradient(circle at center, rgba(255,180,80,0.28), rgba(255,100,200,0.12) 45%, transparent 65%)'
              : messageCount >= 1
              ? 'radial-gradient(circle at center, rgba(255,210,120,0.24), rgba(255,200,180,0.1) 45%, transparent 65%)'
              : 'radial-gradient(circle at center, rgba(255,244,217,0.20), transparent 55%)',
            filter: 'blur(28px)',
          }}
        />
      </motion.div>

      {/* Always-on sparkle particles, brighter/bigger on hover */}
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="pointer-events-none absolute select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${hovering ? s.size * 1.35 : s.size}px`,
            color: s.color,
            textShadow: hovering
              ? `0 0 ${Math.round(s.size)}px ${s.color}, 0 0 ${Math.round(s.size * 2)}px ${s.color}`
              : `0 0 ${Math.round(s.size * 0.6)}px ${s.color}`,
            lineHeight: 1,
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
          animate={{
            opacity: [0, 0.9, 0.7, 0],
            scale: [0.3, 1.2, 1, 0.4],
            y: [4, -(s.driftY), -(s.driftY + 14)],
            rotate: [0, s.driftRotate],
          }}
          transition={{
            delay: s.delay,
            duration: s.duration,
            repeat: Infinity,
            repeatDelay: s.repeatDelay,
            ease: 'easeOut',
          }}
        >
          {s.shape}
        </motion.span>
      ))}
    </motion.button>
  )
}
