import React, { useState, useEffect } from 'react'

// ─── Colour palette exported for AppPatch flying-word animation ───────────────
export const CAT = [
  { bg: 'rgba(255,222,100,0.14)', border: 'rgba(242,195,60,0.38)',  text: '#a07010', glow: 'rgba(242,195,60,0.18)',  hGlow: 'rgba(252,210,70,0.46)'  },
  { bg: 'rgba(255,160,185,0.14)', border: 'rgba(242,120,155,0.38)', text: '#b83060', glow: 'rgba(242,120,155,0.18)', hGlow: 'rgba(255,130,165,0.46)' },
  { bg: 'rgba(255,195,160,0.14)', border: 'rgba(242,158,110,0.38)', text: '#a05020', glow: 'rgba(242,158,110,0.18)', hGlow: 'rgba(252,168,120,0.46)' },
  { bg: 'rgba(255,182,210,0.14)', border: 'rgba(235,140,180,0.38)', text: '#c03870', glow: 'rgba(235,140,180,0.18)', hGlow: 'rgba(245,150,190,0.46)' },
  { bg: 'rgba(210,185,255,0.14)', border: 'rgba(175,145,255,0.38)', text: '#6840c0', glow: 'rgba(175,145,255,0.18)', hGlow: 'rgba(185,155,255,0.46)' },
  { bg: 'rgba(160,235,215,0.14)', border: 'rgba(110,205,180,0.38)', text: '#207060', glow: 'rgba(110,205,180,0.18)', hGlow: 'rgba(120,215,190,0.46)' },
  { bg: 'rgba(155,215,255,0.14)', border: 'rgba(100,180,250,0.38)', text: '#1858a8', glow: 'rgba(100,180,250,0.18)', hGlow: 'rgba(110,190,255,0.46)' },
]

// ─── 6 gemstone items with their category colour ──────────────────────────────
const GEMSTONES = [
  { label: 'Xinh Đẹp',   cat: 1 },  // rose / pink
  { label: 'Dễ Thương',  cat: 4 },  // lavender / purple
  { label: 'Tinh Tế',    cat: 6 },  // sky blue
  { label: 'Thông Minh', cat: 2 },  // coral / orange
  { label: 'Dịu Dàng',   cat: 3 },  // blush / pastel pink
  { label: 'Bí Ẩn',      cat: 5 },  // mint green
]

// ─── 6 positions in a ring — radius shrinks to fit the viewport ─────────────
const DURATIONS = [10.5, 12.0, 11.2, 13.0, 10.8, 11.6]
const DELAYS    = [0.0,  1.1,  0.5,  1.8,  0.3,  1.4 ]
const ORB_ANGLES = [-90, -30, 30, 90, 150, 210]

function computePositions() {
  const H  = 44   // orb half-size (ORB_R)
  // Worst-case horizontal spread = cos(30°) * R + H → keep it inside vw/2
  const maxR = Math.min(
    Math.floor((window.innerWidth  / 2 - H - 12) / 0.866),
    Math.floor((window.innerHeight / 2 - H - 12) / 0.866),
    300
  )
  const R = Math.max(maxR, 110)
  return ORB_ANGLES.map((deg, i) => {
    const rad = deg * Math.PI / 180
    const dx  = Math.round(R * Math.cos(rad))
    const dy  = Math.round(R * Math.sin(rad))
    return { dx, dy, dur: DURATIONS[i], delay: DELAYS[i] }
  })
}

// ─── Magical orb themes (one per CAT index) ───────────────────────────────────
const ORB = [
  // 0 gold
  { c1:'rgba(255,235,120,0.98)', c2:'rgba(255,195,40,0.92)',  c3:'rgba(195,130,5,0.85)',  rim:'rgba(255,215,80,0.7)',  g1:'rgba(255,220,60,0.6)',  g2:'rgba(255,180,20,0.32)', g3:'rgba(220,140,0,0.13)',  spark:'rgba(255,248,180,1)' },
  // 1 rose / pink
  { c1:'rgba(255,165,210,0.98)', c2:'rgba(255,110,172,0.92)', c3:'rgba(205,50,125,0.85)', rim:'rgba(255,130,180,0.7)',  g1:'rgba(255,145,193,0.6)',  g2:'rgba(255,95,162,0.32)',  g3:'rgba(195,45,118,0.13)', spark:'rgba(255,210,235,1)' },
  // 2 coral / peach
  { c1:'rgba(255,190,135,0.98)', c2:'rgba(255,145,90,0.92)',  c3:'rgba(210,85,40,0.85)',  rim:'rgba(255,145,90,0.7)',  g1:'rgba(255,162,110,0.6)',  g2:'rgba(255,120,70,0.32)',  g3:'rgba(195,75,30,0.13)',  spark:'rgba(255,225,190,1)' },
  // 3 blush/lavender
  { c1:'rgba(255,170,220,0.98)', c2:'rgba(222,130,255,0.92)', c3:'rgba(168,78,222,0.85)', rim:'rgba(210,120,245,0.7)',  g1:'rgba(232,148,255,0.6)',  g2:'rgba(190,108,242,0.32)', g3:'rgba(145,62,200,0.13)', spark:'rgba(235,205,255,1)' },
  // 4 lavender/purple
  { c1:'rgba(198,162,255,0.98)', c2:'rgba(160,118,245,0.92)', c3:'rgba(105,58,202,0.85)', rim:'rgba(145,105,235,0.7)',  g1:'rgba(182,140,255,0.6)',  g2:'rgba(140,100,232,0.32)', g3:'rgba(95,48,180,0.13)',  spark:'rgba(215,200,255,1)' },
  // 5 mint/cyan
  { c1:'rgba(135,248,222,0.98)', c2:'rgba(68,220,200,0.92)',  c3:'rgba(18,165,152,0.85)', rim:'rgba(55,200,182,0.7)',   g1:'rgba(98,232,212,0.6)',   g2:'rgba(48,200,180,0.32)',  g3:'rgba(10,148,138,0.13)', spark:'rgba(185,255,245,1)' },
  // 6 sky/ice blue
  { c1:'rgba(135,208,255,0.98)', c2:'rgba(68,168,255,0.92)',  c3:'rgba(18,112,222,0.85)', rim:'rgba(55,148,242,0.7)',   g1:'rgba(110,182,255,0.6)',  g2:'rgba(55,148,242,0.32)',  g3:'rgba(10,98,200,0.13)',  spark:'rgba(195,230,255,1)' },
]

// Sparkle positions (angle°, distance from orb centre px)
const SPARKS = [
  { a:  25, d: 50, sz: 3.5, dur: 2.1, dl: 0.0 },
  { a:  95, d: 48, sz: 2.5, dur: 2.7, dl: 0.6 },
  { a: 160, d: 52, sz: 3.0, dur: 2.0, dl: 1.1 },
  { a: 225, d: 47, sz: 2.0, dur: 2.5, dl: 0.3 },
  { a: 295, d: 51, sz: 3.0, dur: 2.3, dl: 0.9 },
  { a: 345, d: 49, sz: 2.5, dur: 1.9, dl: 1.5 },
]
const ORB_R = 44  // orb radius px → diameter 88

function Bubble({ gem, pos, center, isUsed, onClick }) {
  const t  = ORB[gem.cat]
  const D  = ORB_R * 2
  const H  = ORB_R

  return (
    <div
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = '' }}
      style={{
        position: 'fixed',
        left: `calc(${center.x}% + ${pos.dx - H}px)`,
        top:  `calc(${center.y}% + ${pos.dy - H}px)`,
        zIndex: 30,
        cursor: isUsed ? 'default' : 'pointer',
        opacity: isUsed ? 0 : 1,
        pointerEvents: isUsed ? 'none' : 'auto',
        transition: 'opacity 0.45s ease, transform 0.22s ease',
        userSelect: 'none',
        animationName: 'floatBubble',
        animationDuration: `${pos.dur}s`,
        animationDelay: `${pos.delay}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationFillMode: 'both',
      }}
    >
      {/* ── Orb ── */}
      <div style={{ position: 'relative', width: D, height: D }}>

        {/* Ambient bloom (outermost layer, no clip) */}
        <div style={{
          position: 'absolute',
          inset: -28,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${t.g2} 0%, ${t.g3} 45%, transparent 70%)`,
          filter: 'blur(14px)',
          pointerEvents: 'none',
        }} />

        {/* Main orb sphere */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: [
            // glass highlight – top-left ellipse
            'radial-gradient(ellipse 42% 32% at 33% 26%, rgba(255,255,255,0.95), transparent)',
            // secondary soft highlight – bottom-right
            'radial-gradient(ellipse 25% 18% at 70% 74%, rgba(255,255,255,0.30), transparent)',
            // luminous inner core
            `radial-gradient(circle 55% at 52% 58%, ${t.c1} 0%, transparent 68%)`,
            // crystal body — fully opaque base
            `radial-gradient(circle at 50% 50%, ${t.c2} 0%, ${t.c3} 60%, ${t.c3} 100%)`,
          ].join(', '),
          boxShadow: [
            `inset 0 0 22px 6px ${t.g1}`,
            `0 0 18px 6px ${t.g1}`,
            `0 0 45px 16px ${t.g2}`,
            `0 0 88px 30px ${t.g3}`,
          ].join(', '),
        }} />

        {/* Label centered inside orb */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.97)',
            textShadow: '0 1px 3px rgba(0,0,0,0.55), 0 0 12px rgba(255,255,255,0.9)',
            textAlign: 'center',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
            maxWidth: D * 0.78,
            wordBreak: 'keep-all',
          }}>{gem.label}</span>
        </div>

        {/* Rim light – bottom arc */}
        <div style={{
          position: 'absolute',
          bottom: 7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: D * 0.52,
          height: D * 0.14,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${t.rim}, transparent)`,
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }} />

        {/* Sparkle particles orbiting the orb */}
        {SPARKS.map((sp, i) => {
          const rad = (sp.a * Math.PI) / 180
          const cx  = ORB_R + Math.cos(rad) * sp.d - sp.sz / 2
          const cy  = ORB_R + Math.sin(rad) * sp.d - sp.sz / 2
          return (
            <div key={i} style={{
              position:     'absolute',
              left:         cx,
              top:          cy,
              width:        sp.sz,
              height:       sp.sz,
              borderRadius: '50%',
              background:   t.spark,
              boxShadow:    `0 0 ${sp.sz * 2.5}px ${sp.sz * 1.2}px ${t.spark}`,
              animation:    `orbSparkle ${sp.dur}s ease-in-out ${sp.dl}s infinite`,
              pointerEvents:'none',
            }} />
          )
        })}
      </div>


    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WordBubbles({ onSend, center = { x: 50, y: 50 } }) {
  const [usedIndices, setUsedIndices] = useState(new Set())
  const [positions,   setPositions  ] = useState(computePositions)

  useEffect(() => {
    const onResize = () => setPositions(computePositions())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleClick = (idx) => {
    if (usedIndices.has(idx)) return
    setUsedIndices(prev => new Set([...prev, idx]))

    const gem = GEMSTONES[idx]
    const pos = positions[idx]

    // Convert orb centre from pixel offset to viewport percentage for the fly animation
    const cx = center.x + (pos.dx / window.innerWidth  * 100)
    const cy = center.y + (pos.dy / window.innerHeight * 100)

    onSend([{
      id:   idx + 1,
      word: gem.label,
      cat:  gem.cat,
      pos:  { x: cx, y: cy },
    }])
  }

  return (
    <>
      {GEMSTONES.map((gem, idx) => (
        <Bubble
          key={idx}
          gem={gem}
          pos={positions[idx]}
          center={center}
          isUsed={usedIndices.has(idx)}
          onClick={() => handleClick(idx)}
        />
      ))}
    </>
  )
}