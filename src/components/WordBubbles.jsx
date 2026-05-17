import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// word registry
const WORD_CAT = {
  // joy / soft happiness
  'vui': 0,
  'hạnh phúc': 0,
  'cười': 0,
  'thật vui': 0,
  'thật đẹp': 0,
  'toả sáng': 0,
  'rạng rỡ': 0,
  'ấm áp': 0,
  'đáng yêu': 0,
  'dễ thương': 0,
  'vui vẻ': 0,
  'nhẹ nhàng': 0,
  'nhẹ nhàng hơn': 1,
  'thoải mái': 0,

  // comfort / healing
  'bình yên': 1,
  'an yên': 1,
  'dịu dàng': 1,
  'nghỉ ngơi': 1,
  'nhẹ lòng': 1,
  'ấm lòng': 1,
  'ổn thôi': 1,
  'được thương': 1,
  'được quan tâm': 1,
  'thảnh thơi': 1,

  // companionship
  'cậu': 2,
  'thương': 2,
  'bên cạnh': 2,
  'ở đây': 2,
  'quan tâm': 2,
  'cảm ơn': 2,
  'gặp': 2,
  'xuất hiện': 2,

  // dreamy / aesthetic
  'ánh sáng': 3,
  'ánh sao': 3,
  'ngôi sao': 3,
  'phép màu': 3,
  'lung linh': 3,
  'rực rỡ': 3,
  'dream': 3,
  'sparkle': 3,
  'moonlight': 3,

  // connectors
  'mong': 4,
  'luôn': 4,
  'hãy': 4,
  'nhé': 4,
  'thật': 4,
  'một chút': 4,
  'hôm nay': 4,
  'với': 4,
  'vì': 4,
  'đã': 4,
  'được': 4,
  'không': 4,
  'quá': 4,
  'mọi chuyện': 4,
  'nhiều điều': 4,

  // english aesthetic
  'happy': 5,
  'smile': 5,
  'shine': 5,
  'soft': 5,
  'warm': 5,
  'cozy': 5,
  'beautiful': 5,
}

const TEMPLATES = [
  ['mong', 'cậu', 'thật vui'],
  ['mong', 'cậu', 'bình yên'],
  ['luôn', 'cười', 'nhé'],
  ['hôm nay', 'lung linh'],
  ['cậu', 'thật', 'đặc biệt'],
  ['cậu', 'đáng yêu', 'ghê'],
  ['mong', 'mọi điều', 'tốt đẹp'],
  ['ánh sáng', 'bên cạnh', 'cậu'],
  ['mong', 'cậu', 'an yên'],
  ['thật', 'ấm áp', 'nhé'],
  ['mong', 'cậu', 'luôn', 'cười'],
  ['cậu', 'xứng đáng', 'hạnh phúc'],
  ['thương', 'nhiều', 'nhé'],
  ['mong', 'cậu', 'nhẹ nhàng hơn'],
  ['hôm nay', 'thật đẹp'],
  ['mong', 'cậu', 'ngủ ngon'],
  ['ở cạnh', 'cậu', 'thật vui'],
  ['cậu', 'toả sáng', 'ghê'],
  ['một chút', 'bình yên'],
  ['mong', 'cậu', 'được', 'nghỉ ngơi'],
  ['ánh sao', 'lung linh'],
  ['cậu', 'làm', 'mọi thứ', 'dịu dàng'],
  ['mong', 'cậu', 'thật', 'hạnh phúc'],
  ['nụ cười', 'thật đẹp'],
  ['thật', 'dễ chịu', 'ghê'],
  ['gặp', 'cậu', 'thật vui'],

  ['mong', 'hôm nay', 'nhẹ nhàng'],
  ['cậu', 'đáng được', 'quan tâm'],
  ['mong', 'cậu', 'luôn', 'rạng rỡ'],
  ['hôm nay', 'ấm áp', 'nhé'],
  ['cảm ơn', 'vì', 'đã', 'xuất hiện'],
  ['mong', 'cậu', 'được', 'vui vẻ'],
  ['một ngày', 'thật', 'dịu dàng'],
  ['cậu', 'giống', 'phép màu'],
  ['mong', 'cậu', 'thật', 'thoải mái'],
  ['ở đây', 'với', 'cậu'],
  ['mong', 'cậu', 'không', 'quá mệt'],
  ['nhiều', 'điều', 'đẹp đẽ'],
  ['cậu', 'là', 'ánh sáng'],
  ['mong', 'cậu', 'thật', 'rực rỡ'],
  ['thấy', 'cậu', 'cười', 'là', 'đủ'],
  ['mong', 'cậu', 'luôn', 'được', 'thương'],
  ['một chút', 'phép màu'],
  ['thật', 'nhẹ lòng', 'nhé'],
  ['mong', 'cậu', 'thật', 'ấm lòng'],
  ['cậu', 'làm', 'hôm nay', 'đẹp hơn'],
  ['mong', 'mọi chuyện', 'ổn thôi'],
  ['cậu', 'thật', 'rạng rỡ'],
  ['mong', 'cậu', 'luôn', 'dịu dàng', 'với', 'bản thân'],
]

export const CAT = [
  { bg: 'rgba(255,222,100,0.14)', border: 'rgba(242,195,60,0.38)',  text: '#a07010', glow: 'rgba(242,195,60,0.18)',  hGlow: 'rgba(252,210,70,0.46)'  },
  { bg: 'rgba(255,160,185,0.14)', border: 'rgba(242,120,155,0.38)', text: '#b83060', glow: 'rgba(242,120,155,0.18)', hGlow: 'rgba(255,130,165,0.46)' },
  { bg: 'rgba(255,195,160,0.14)', border: 'rgba(242,158,110,0.38)', text: '#a05020', glow: 'rgba(242,158,110,0.18)', hGlow: 'rgba(252,168,120,0.46)' },
  { bg: 'rgba(255,182,210,0.14)', border: 'rgba(235,140,180,0.38)', text: '#c03870', glow: 'rgba(235,140,180,0.18)', hGlow: 'rgba(245,150,190,0.46)' },
  { bg: 'rgba(210,185,255,0.14)', border: 'rgba(175,145,255,0.38)', text: '#6840c0', glow: 'rgba(175,145,255,0.18)', hGlow: 'rgba(185,155,255,0.46)' },
  { bg: 'rgba(160,235,215,0.14)', border: 'rgba(110,205,180,0.38)', text: '#207060', glow: 'rgba(110,205,180,0.18)', hGlow: 'rgba(120,215,190,0.46)' },
  { bg: 'rgba(155,215,255,0.14)', border: 'rgba(100,180,250,0.38)', text: '#1858a8', glow: 'rgba(100,180,250,0.18)', hGlow: 'rgba(110,190,255,0.46)' },
]

const DECORATORS = ['❀', '✿', '❁', '⚘', 'ꕤ', '🌸', '🪻', '🧸', '✦', '✧']

function r01(seed) {
  const v = Math.abs(Math.sin(seed * 127.1 + Math.cos(seed * 31.4) * 11.8)) * 43758.5453
  return v - Math.floor(v)
}
const jit = (seed, amp) => (r01(seed * 13.7 + 4.9) - 0.5) * 2 * amp

// Full-screen border-zone layout, bottle center (x 28-72%, y 22-78%) clear
function buildPositions(count) {
  const topN   = Math.max(1, Math.round(count * 0.33))
  const botN   = Math.max(1, Math.round(count * 0.33))
  const leftN  = Math.max(0, Math.floor((count - topN - botN) / 2))
  const rightN = Math.max(0, count - topN - botN - leftN)
  const raw = []
  // Top strip: x 8-68% (capped so rightmost bubble stays on screen)
  for (let i = 0; i < topN; i++)
    raw.push({ x: 8 + i * (60 / Math.max(topN - 1, 1)) + jit(i + 1, 2),        y: 5  + jit(i + 10, 4),         anchor: 'left'  })
  // Bottom strip: x 8-68%
  for (let i = 0; i < botN; i++)
    raw.push({ x: 8 + i * (60 / Math.max(botN - 1, 1)) + jit(topN + i + 1, 2), y: 87 + jit(topN + i + 10, 4),  anchor: 'left'  })
  // Left strip: x 3-20%, y 25-73%
  for (let i = 0; i < leftN; i++)
    raw.push({ x: 4 + jit(topN + botN + i + 1, 3),                              y: 28 + i * (46 / Math.max(leftN  - 1, 1)) + jit(topN + botN + i + 10, 3),           anchor: 'left'  })
  // Right strip: anchored to RIGHT edge so it's never clipped on mobile
  for (let i = 0; i < rightN; i++)
    raw.push({ x: 3 + jit(topN + botN + leftN + i + 1, 2),                      y: 28 + i * (46 / Math.max(rightN - 1, 1)) + jit(topN + botN + leftN + i + 10, 3), anchor: 'right' })
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r01(i * 7.3 + 2.1) * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order.map((slot, wi) => ({
    x: raw[slot].x, y: raw[slot].y, anchor: raw[slot].anchor,
    dur: 10 + r01(wi * 2.3) * 8,
    delay: r01(wi) * 5,
  }))
}

function buildSession(usedIndices) {
  const pickCount = 3  // templates per session
  // Build shuffled index list, skipping already-used templates
  const available = TEMPLATES
    .map((_, i) => i)
    .filter(i => !usedIndices.has(i))
    .sort(() => Math.random() - 0.5)
  // If fewer available than needed, pick from available (reset happens outside)
  const pickedIndices = available.slice(0, pickCount)
  const picked = pickedIndices.map(i => TEMPLATES[i])
  // seen: word → { cat, templateId }
  const seen = new Map()
  picked.forEach((tpl, tplIdx) => {
    tpl.forEach(w => {
      if (!seen.has(w))
        seen.set(w, { cat: WORD_CAT[w] ?? 5, templateId: tplIdx })
    })
  })
  const words = [...seen.entries()]
    .slice(0, 16)
    .map(([word, { cat, templateId }], i) => ({
      id: i + 1, word, cat, templateId,
      deco: DECORATORS[Math.floor(Math.random() * DECORATORS.length)],
    }))
  const positions = buildPositions(words.length)
  return {
    words: words.map((w, i) => ({ ...w, pos: positions[i] })),
    pickedIndices,
  }
}

function Bubble({ word, idx, isUsed, onClick }) {
  const s = CAT[word.cat]
  const p = word.pos
  return (
    <AnimatePresence>
      {!isUsed && (
        // Outer div: CSS float (compositor thread, zero JS overhead)
        <div style={{
          position: 'fixed',
          ...(p.anchor === 'right' ? { right: `${p.x}%` } : { left: `${p.x}%` }),
          top: `${p.y}%`,
          zIndex: 10,
          animation: `floatBubble ${p.dur}s ${-p.delay * 0.8}s ease-in-out infinite`,
          willChange: 'transform',
        }}>
          {/* motion.button: one-time entrance + exit only, no repeat */}
          <motion.button
            key={`${word.id}-${word.word}`}
            type="button"
            onClick={() => onClick(word)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.22 } }}
            transition={{ duration: 0.45, delay: 0.15 + idx * 0.12, ease: 'easeOut' }}
            whileHover={{ scale: 1.13 }}
            whileTap={{ scale: 0.88 }}
            style={{
              background: s.bg.replace('0.14', '0.82'),
              border: `1px solid ${s.border.replace('0.38', '0.28')}`,
              boxShadow: `0 0 10px 2px ${s.glow}`,
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: s.text,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              lineHeight: 1.4,
              userSelect: 'none',
            }}
          >
            {word.deco}{word.word}{word.deco}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function WordBubbles({ onSend, onNewSession }) {
  const usedRef = useRef(null)
  const [sessionWords, setSessionWords] = useState(() => {
    usedRef.current = new Set()
    const session = buildSession(usedRef.current)
    session.pickedIndices.forEach(i => usedRef.current.add(i))
    return session.words
  })
  const [sentIds, setSentIds] = useState(new Set())

  // Fire onNewSession when the component first mounts
  const onNewSessionRef = useRef(onNewSession)
  onNewSessionRef.current = onNewSession
  useEffect(() => { onNewSessionRef.current?.() }, [])

  const handleClick = useCallback((word) => {
    // Send the whole template sentence this word belongs to
    const sentence = sessionWords.filter(
      w => !sentIds.has(w.id) && w.templateId === word.templateId
    )
    const ids = sentence.map(w => w.id)
    setSentIds(prev => {
      const nextIds = new Set([...prev, ...ids])
      if (nextIds.size >= sessionWords.length) {
        setTimeout(() => {
          // Reset used set when all templates have been shown
          if (usedRef.current.size >= TEMPLATES.length - 2) usedRef.current = new Set()
          const session = buildSession(usedRef.current)
          session.pickedIndices.forEach(i => usedRef.current.add(i))
          setSessionWords(session.words)
          setSentIds(new Set())
          onNewSessionRef.current?.()
        }, 1600)
      }
      return nextIds
    })
    onSend(sentence)
  }, [sessionWords, sentIds, onSend])
  return (
    <>
      {sessionWords.map((word, idx) => (
        <Bubble key={`${word.id}-${word.word}`} word={word} idx={idx} isUsed={sentIds.has(word.id)} onClick={handleClick} />
      ))}
    </>
  )
}