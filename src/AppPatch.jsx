import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Bottle from './components/Bottle'
import StarryNight from './components/StarryNight'
import WordBubbles, { CAT } from './components/WordBubbles'
import luballyUrl from './audio/lubally.mp3'
import angelUrl from '../assets/angel.png'

const randomBetween = (min, max) => min + Math.random() * (max - min)

// ─── Night-sky colour palette (bright on dark) ────────────────────────────────
const NIGHT_COLORS = [
  { text: '#ffd54f', glow: 'rgba(255,213,79,0.65)'  },  // 0 gold
  { text: '#f48fb1', glow: 'rgba(244,143,177,0.65)' },  // 1 rose
  { text: '#ffab91', glow: 'rgba(255,171,145,0.65)' },  // 2 coral
  { text: '#f8bbd0', glow: 'rgba(248,187,208,0.65)' },  // 3 blush
  { text: '#ce93d8', glow: 'rgba(206,147,216,0.65)' },  // 4 lavender
  { text: '#80cbc4', glow: 'rgba(128,203,196,0.65)' },  // 5 mint
  { text: '#81d4fa', glow: 'rgba(129,212,250,0.65)' },  // 6 sky
]

// Build 2×N positions spread across the full night screen.
// Word i uses slot[i] on even cycles, slot[i+N] on odd cycles → always moves.
function r01n(s) {
  const v = Math.abs(Math.sin(s * 127.1 + Math.cos(s * 31.4) * 11.8)) * 43758.5453
  return v - Math.floor(v)
}
function computeNightSlots(N) {
  if (N === 0) return []
  // Each sentence owns an equal y-band → no vertical overlap possible
  const bandH = 82 / Math.max(N, 1)
  return [
    // Set A: spread across full width (5-65%) so sentences use the whole screen
    ...Array.from({ length: N }, (_, i) => ({
      x: 5  + r01n(i * 3.7)       * 60,  // 5-65%
      y: 8  + i * bandH + r01n(i * 5.3)       * bandH * 0.5,
    })),
    // Set B: slightly shifted so sentence moves visibly between cycles
    ...Array.from({ length: N }, (_, i) => ({
      x: 8  + r01n(i * 3.7 + 20)  * 57,  // 8-65%
      y: 8  + i * bandH + r01n(i * 5.3 + 20) * bandH * 0.5,
    })),
  ]
}

// Floating sentence in the night sky — pure CSS animation, no JS per frame
function NightSentence({ words, slotA, slotB, initDelay }) {
  const divRef   = useRef(null)
  const slotIdx  = useRef(0)
  const timerRef = useRef(null)
  const seed = words.reduce((s, w) => s + (w.id ?? 0), 0)
  const dur  = 3.0 + Math.abs(Math.sin(seed * 2.3)) * 1.5  // 3–4.5 s
  const slots = [slotA, slotB]

  // Clean up on unmount (night overlay closes)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const handleAnimEnd = useCallback(() => {
    const pause = 400 + Math.random() * 1400
    timerRef.current = setTimeout(() => {
      const el = divRef.current
      if (!el) return
      slotIdx.current = (slotIdx.current + 1) % 2
      const next = slots[slotIdx.current]
      el.style.left = `${next.x}%`
      el.style.top  = `${next.y}%`
      // restart CSS animation
      el.style.animationName = 'none'
      void el.offsetWidth          // force reflow
      el.style.animationName = 'nightFloat'
      el.style.animationDelay = '0s'
    }, pause)
  }, [slots])

  return (
    <div
      ref={divRef}
      onAnimationEnd={handleAnimEnd}
      style={{
        position: 'fixed',
        left: `${slotA.x}%`,
        top:  `${slotA.y}%`,
        animationName: 'nightFloat',
        animationDuration: `${dur}s`,
        animationDelay: `${initDelay}s`,
        animationTimingFunction: 'ease-in-out',
        animationFillMode: 'both',
        pointerEvents: 'none',
        zIndex: 105,
        display: 'flex',
        gap: '0.45em',
        flexWrap: 'nowrap',        // never break to 2 lines
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {words.map((w, i) => {
        const nc = NIGHT_COLORS[w.cat] ?? NIGHT_COLORS[0]
        return (
          <span key={i} style={{
            color: nc.text,
            textShadow: `0 0 18px ${nc.glow}, 0 0 40px ${nc.glow.replace('0.65', '0.22')}`,
            fontSize: '1.05rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            lineHeight: 1.6,
            whiteSpace: 'nowrap',
          }}>{w.word}</span>
        )
      })}
    </div>
  )
}

// ─── Falling unicode stars ────────────────────────────────────────────────────
const UNICODE_FALL_CHARS = ['✦', '✧', '✩', '★', '⋆', '✫', '✬', '✭', '✯', '✰', '·', '✦', '✧', '✩']
const FALL_STARS = Array.from({ length: 55 }, (_, i) => ({
  id:     i,
  char:   UNICODE_FALL_CHARS[i % UNICODE_FALL_CHARS.length],
  left:   (i * 37.3 + 11.7) % 100,
  startY: (i * 61.8 + 5.3)  % 100,
  size:   i % 9 === 0 ? 1.3 + (i % 3) * 0.3   // big bright ones
                      : 0.5 + (i % 5) * 0.18, // rem
  dur:    1.8 + (i % 9) * 0.42,
  delay:  -((i * 0.97) % 7),
  opacity: 0.3 + (i % 7) * 0.1,
  bright: i % 9 === 0,
}))

function FallingStars() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
      <style>{`
        @keyframes starFall {
          0%   { transform: translateY(0);      opacity: 0; }
          7%   { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes angelFloat {
          0%,100% { transform: translateY(0px) rotate(-4deg); }
          50%     { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes angelStarRise {
          0%   { transform: translateY(0) scale(0.5);    opacity: 0; }
          18%  { opacity: 1; }
          100% { transform: translateY(-140px) scale(1); opacity: 0; }
        }
      `}</style>
      {FALL_STARS.map(s => (
        <span
          key={s.id}
          style={{
            position:   'absolute',
            left:       `${s.left}%`,
            top:        `${s.startY}%`,
            fontSize:   `${s.size}rem`,
            color:      s.bright ? 'rgba(255,248,210,0.95)' : `rgba(200,220,255,${s.opacity})`,
            textShadow: s.bright
              ? `0 0 12px rgba(255,235,160,0.9), 0 0 28px rgba(255,210,100,0.5)`
              : `0 0 6px rgba(180,210,255,${s.opacity * 0.8})`,
            animation:  `starFall ${s.dur}s linear ${s.delay}s infinite`,
            willChange: 'transform, opacity',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  )
}

export default function App() {
  const [flyingWords, setFlyingWords] = useState([])
  const [bottleSentences, setBottleSentences] = useState([])  // array of word[]
  const [starSeed, setStarSeed]       = useState(0)
  const [nightMode, setNightMode]     = useState(false)

  const bottleRef  = useRef(null)
  const timeoutRef = useRef([])
  const audioRef   = useRef(null)   // HTMLAudioElement for lubally.mp3

  const bottleActive = bottleSentences.length > 0
  const messageCount = bottleSentences.length
  const bottleFull   = bottleSentences.length >= 6

  // Track actual bottle-element centre so orbs orbit the real visual centre
  const [bottleCenter, setBottleCenter] = useState({ x: 50, y: 50 })
  const measureBottle = useCallback(() => {
    const el = bottleRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setBottleCenter({
      x: (r.left + r.width  * 0.5) / window.innerWidth  * 100,
      y: (r.top  + r.height * 0.5) / window.innerHeight * 100,
    })
  }, [])
  useLayoutEffect(() => {
    measureBottle()
    window.addEventListener('resize', measureBottle)
    return () => window.removeEventListener('resize', measureBottle)
  }, [measureBottle])

  useEffect(() => () => {
    timeoutRef.current.forEach(window.clearTimeout)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const nightSlots = useMemo(() => computeNightSlots(bottleSentences.length), [bottleSentences.length])

  const handleBubbleSend = useCallback((words) => {
    if (!words.length) return
    const bottleRect = bottleRef.current?.getBoundingClientRect()
    if (!bottleRect) return

    const bcx = bottleRect.left + bottleRect.width * 0.5
    const bcy = bottleRect.top  + bottleRect.height * 0.38
    const sendId = Date.now()

    const newFlyers = words.map((w, i) => ({
      uid:       `${w.word}-${sendId}-${i}`,
      word:      w.word,
      cat:       w.cat,
      startPctX: w.pos.x,
      startPctY: w.pos.y,
      deltaX:    bcx - (w.pos.x / 100 * window.innerWidth),
      deltaY:    bcy - (w.pos.y / 100 * window.innerHeight),
      delay:     i * 0.1,
    }))

    setFlyingWords(prev => [...prev, ...newFlyers])
    setBottleSentences(prev => [...prev, words])
    setNightMode(false)

    // Remove flyers + sparkle the bottle after fly animation
    const t = window.setTimeout(() => {
      setFlyingWords(prev => prev.filter(fw => !newFlyers.some(nf => nf.uid === fw.uid)))
      setStarSeed(v => v + 1)
    }, 1100)
    timeoutRef.current.push(t)
  }, [])

  const handleBottleClick = useCallback(() => {
    if (!bottleActive) return
    // Start lubally.mp3 on first click; keep looping
    if (!audioRef.current) {
      const audio = new Audio(luballyUrl)
      audio.loop = true
      audio.volume = 0.5
      audio.play()
      audioRef.current = audio
    }
    setStarSeed(v => v + 1)
    setNightMode(prev => !prev)
  }, [bottleActive])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,246,250,0.95),transparent_58%),linear-gradient(180deg,rgba(250,233,245,0.96),rgba(236,210,239,0.92))] text-slate-900">

      {/* Full-screen starry night overlay */}
      <AnimatePresence>
        {nightMode && (
          <motion.div
            className="fixed inset-0 z-[100] cursor-pointer overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            onClick={() => setNightMode(false)}
          >
            {/* Deep night sky */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 38% 22%, rgba(22,12,68,1) 0%, rgba(8,5,30,1) 55%, rgba(2,2,14,1) 100%)' }} />
            {/* Stars falling past you as you plummet through space */}
            <FallingStars />
            <StarryNight active={true} seed={starSeed} />
            {/* Aurora shimmer */}
            <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(80,40,160,0.35), rgba(40,160,140,0.14), transparent)' }} />
            {/* Moon glow */}
            <div className="absolute pointer-events-none" style={{ top: '6%', right: '10%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,248,210,0.22) 0%, rgba(255,230,130,0.08) 50%, transparent 70%)', filter: 'blur(18px)' }} />
            {/* Angel — truly centred; positioning and animation are split across two divs
                 so angelFloat transform doesn't clobber translate(-50%,-50%) */}
            <div className="absolute pointer-events-none" style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}>
              <div style={{
                animation: 'angelFloat 5s ease-in-out infinite',
                filter: 'drop-shadow(0 0 32px rgba(255,235,180,0.6)) drop-shadow(0 0 70px rgba(200,170,255,0.35))',
              }}>
                <img src={angelUrl} alt="" style={{ width: 260, opacity: 0.92, userSelect: 'none', display: 'block' }} />
              </div>
            </div>

            {/* Rising stars from angel — positioned at screen centre, float upward */}
            <div className="absolute pointer-events-none" style={{ inset: 0, zIndex: 11 }}>
              {[...Array(16)].map((_, i) => {
                const chars = ['✦','✧','✩','⋆','✫','✬','✭','✯']
                const offsetX = ((i * 43.7 + 17) % 320) - 160   // –160 to +160 px from centre
                const startOffY = 60 + (i % 5) * 40              // 60–220 px below centre
                const size    = 0.6 + (i % 5) * 0.2
                const dur     = 2.0 + (i % 6) * 0.45
                const delay   = -((i * 0.91) % 4)
                const opacity = 0.55 + (i % 4) * 0.12
                return (
                  <span key={i} style={{
                    position:   'absolute',
                    left:       `calc(50% + ${offsetX}px)`,
                    top:        `calc(50% + ${startOffY}px)`,
                    fontSize:   `${size}rem`,
                    color:      i % 6 === 0 ? 'rgba(255,248,200,0.98)' : `rgba(210,195,255,${opacity})`,
                    textShadow: i % 6 === 0
                      ? '0 0 12px rgba(255,230,140,1), 0 0 28px rgba(255,200,80,0.6)'
                      : `0 0 8px rgba(190,170,255,${opacity})`,
                    animation:  `angelStarRise ${dur}s ease-out ${delay}s infinite`,
                    willChange: 'transform, opacity',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>{chars[i % chars.length]}</span>
                )
              })}
            </div>



            {/* Dismiss hint */}
            <motion.p
              className="absolute bottom-8 left-0 right-0 text-center text-white/30 text-sm select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              ✦ chạm để quay lại ✦
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <StarryNight active={bottleActive} seed={starSeed} />
      <div className="absolute inset-0 -z-10 dream-bg" />
      <div className="absolute inset-0 pointer-events-none grain" />

      {/* Word bubbles — hide when bottle is full */}
      {!bottleFull && <WordBubbles onSend={handleBubbleSend} center={bottleCenter} onNewSession={() => setStarSeed(v => v + 1)} />}

      {/* Flying words — animate from bubble position to bottle */}
      <AnimatePresence>
        {flyingWords.map((fw) => {
          const s = CAT[fw.cat]
          return (
            <motion.span
              key={fw.uid}
              style={{
                position: 'fixed',
                left: `${fw.startPctX}%`,
                top: `${fw.startPctY}%`,
                zIndex: 60,
                pointerEvents: 'none',
                background: s.bg.replace('0.14', '0.55'),
                border: `1px solid ${s.border}`,
                borderRadius: '9999px',
                padding: '6px 15px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: s.text,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 22px 7px ${s.hGlow}`,
                whiteSpace: 'nowrap',
              }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ x: fw.deltaX, y: fw.deltaY, scale: 0.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: fw.delay ?? 0, ease: [0.36, 0.07, 0.19, 0.97] }}
            >
              {fw.word}
            </motion.span>
          )
        })}
      </AnimatePresence>

      {/* Centered bottle */}
      <div className="relative flex min-h-screen items-center justify-center pointer-events-none">
        <div className="relative z-10 pointer-events-auto">
          <div ref={bottleRef} className="relative">
            <Bottle active={bottleActive} messageCount={messageCount} onInteract={bottleActive ? handleBottleClick : undefined} />
          </div>
          {bottleActive && (
            <div className="sparkle-cluster pointer-events-none absolute inset-0">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} className="sparkle-dot" style={{
                  top: `${randomBetween(12, 88)}%`,
                  left: `${randomBetween(22, 78)}%`,
                  width: `${randomBetween(2.5, 5.5)}px`,
                  height: `${randomBetween(2.5, 5.5)}px`,
                  animationDelay: `${randomBetween(0, 2)}s`,
                }} />
              ))}
            </div>
          )}
          {/* Tap hint when bottle is full */}
          <AnimatePresence>
            {bottleFull && !nightMode && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: '-2.4rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem',
                  color: 'rgba(160,80,180,0.85)',
                  textShadow: '0 0 12px rgba(200,120,240,0.5)',
                  pointerEvents: 'none',
                  letterSpacing: '0.06em',
                }}
              >
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


