export function startAmbience(){
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination)

  // gentle bell arpeggio using FM-like short envelopes
  const notes = [660, 880, 990, 880]
  let t0 = ctx.currentTime
  function playBell(freq, when){
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(master)
    const dur = 1.6
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(0.12, when + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.start(when)
    osc.stop(when + dur + 0.1)
  }

  let idx = 0
  const interval = setInterval(()=>{
    const now = ctx.currentTime
    for(let i=0;i<3;i++){
      const n = notes[(idx + i) % notes.length] * (i===1?0.5:1)
      playBell(n, now + i*0.12)
    }
    idx = (idx + 1) % notes.length
  }, 2400)

  // slow shimmer pad
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 220
  g.gain.value = 0.02
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.06
  lfoGain.gain.value = 20
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)
  osc.connect(g)
  g.connect(master)
  osc.start()
  lfo.start()

  return { stop(){ clearInterval(interval); osc.stop(); lfo.stop(); ctx.close() } }
}
