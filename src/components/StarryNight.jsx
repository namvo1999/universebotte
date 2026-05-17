import React, { useEffect, useMemo, useState } from 'react'

const palette = ['255,255,255', '225,235,255', '255,220,230']
const randomBetween = (min, max) => min + Math.random() * (max - min)
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const buildShadow = (count, sizeRange, alphaRange) => {
  const shadows = []
  for (let i = 0; i < count; i++) {
    const x = randomBetween(0, 100).toFixed(2)
    const y = randomBetween(0, 100).toFixed(2)
    const size = randomBetween(sizeRange[0], sizeRange[1]).toFixed(2)
    const alpha = randomBetween(alphaRange[0], alphaRange[1]).toFixed(2)
    const color = randomFrom(palette)
    shadows.push(`${x}vw ${y}vh 0 ${size}px rgba(${color}, ${alpha})`)
  }
  return shadows.join(', ')
}

const createTwinkles = () => {
  return Array.from({ length: 12 }, () => ({
    top: randomBetween(5, 95),
    left: randomBetween(5, 95),
    size: randomBetween(1.2, 2.4),
    alpha: randomBetween(0.22, 0.6),
    delay: randomBetween(0, 4),
  }))
}

const UNICODE_CHARS = ['✦', '✧', '✩', '★', '·', '✦', '✧', '✦', '✩', '·']

const createUnicodeStars = () =>
  Array.from({ length: 22 }, (_, i) => ({
    char: UNICODE_CHARS[i % UNICODE_CHARS.length],
    top: randomBetween(3, 94),
    left: randomBetween(3, 94),
    size: randomBetween(10, 24),
    delay: randomBetween(0, 5),
    duration: randomBetween(2.2, 5.5),
    opacity: randomBetween(0.45, 0.92),
  }))

export default function StarryNight({ active = false, seed = 0 }) {
  const starLayers = useMemo(() => ({
    background: buildShadow(45, [0.4, 0.7], [0.10, 0.22]),
    mid: buildShadow(30, [0.7, 1.1], [0.16, 0.34]),
    glow: buildShadow(18, [1.1, 1.7], [0.24, 0.42]),
  }), [])

  const twinkles = useMemo(createTwinkles, [])
  const unicodeStars = useMemo(createUnicodeStars, [])
  const [burstGlow, setBurstGlow] = useState(false)

  useEffect(() => {
    if (seed == null) return
    setBurstGlow(true)
    const timeout = window.setTimeout(() => setBurstGlow(false), 420)
    return () => window.clearTimeout(timeout)
  }, [seed])

  return (
    <div className={`starry-night absolute inset-0 pointer-events-none transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="star-layer layer-bg" style={{ boxShadow: starLayers.background }} />
      <div className="star-layer layer-mid" style={{ boxShadow: starLayers.mid }} />
      <div className="star-layer layer-glow" style={{ boxShadow: starLayers.glow }} />
      <div className="twinkle-group" aria-hidden="true">
        {twinkles.map((item, idx) => (
          <div
            key={idx}
            className="twinkle"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              opacity: item.alpha,
              animationDelay: `${item.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Unicode star characters */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {unicodeStars.map((s, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              fontSize: `${s.size}px`,
              color: `rgba(255,255,255,${s.opacity})`,
              textShadow: `0 0 ${Math.round(s.size * 0.9)}px rgba(255,240,200,${s.opacity}), 0 0 ${Math.round(s.size * 1.8)}px rgba(255,220,140,${s.opacity * 0.5})`,
              animation: `twinkleEase ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {s.char}
          </span>
        ))}
      </div>
      {burstGlow && <div className="starry-burst absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,240,210,0.16),transparent_30%)] mix-blend-screen pointer-events-none" />}
    </div>
  )
}
