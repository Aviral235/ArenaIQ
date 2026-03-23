import { useState, useEffect, useRef } from 'react'
import { getModels, runBattle, submitHumanVote, optimizeResponse, getLeaderboard } from '../api'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

/* ─── Shared Glass PageHeader ─── */
function PageHeader({ tag, tagColor, title, subtitle, isMobile, isTablet }) {
  const tagRef = useRef(null), h1Ref = useRef(null), subRef = useRef(null), hdrRef = useRef(null)
  const hdrPad = isMobile ? '40px 20px 28px' : isTablet ? '46px 32px 32px' : '52px 64px 36px'

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(tagRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0.1)
      tl.fromTo(h1Ref.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7 }, 0.2)
      if (subRef.current) tl.fromTo(subRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.4)
    }, hdrRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={hdrRef} style={{ padding: hdrPad }}>
      <div ref={tagRef} className="section-label" style={{ color: tagColor, opacity: 0 }}>{tag}</div>
      <h1 ref={h1Ref} style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(2.5rem,5vw,3.5rem)', fontWeight: 800, lineHeight: '0.95', clipPath: 'inset(0 100% 0 0)' }}>{title}</h1>
      {subtitle && <p ref={subRef} style={{ color: 'rgba(255,255,255,0.45)', marginTop: '12px', maxWidth: '600px', fontSize: '0.95rem', fontWeight: 300, opacity: 0 }}>{subtitle}</p>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// VOTE
// ══════════════════════════════════════════════════════════════════════════════
export function Vote() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const [prompt, setPrompt] = useState('')
  const [modelA, setModelA] = useState('gemini-2.5-flash')
  const [modelB, setModelB] = useState('llama-3.3-70b-versatile')
  const [models, setModels] = useState([])
  const [battle, setBattle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(null)
  const [count, setCount] = useState(0)

  const pageRef = useRef(null), formRef = useRef(null)

  useEffect(() => { getModels().then(r => setModels(r.data.models)).catch(() => {}) }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      if (formRef.current) gsap.fromTo(formRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.4, ease: 'power2.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const gen = async () => { if (!prompt.trim()) return; setLoading(true); setBattle(null); setVoted(null); try { const r = await runBattle(prompt, modelA, modelB); setBattle(r.data) } finally { setLoading(false) } }
  const vote = async (winner) => { if (!battle || voted) return; await submitHumanVote({ battle_id: battle.battle_id, prompt, response_a: battle.response_a, response_b: battle.response_b, winner, model_a: modelA, model_b: modelB }); setVoted(winner); setCount(c => c + 1) }

  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'
  const gridCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <div ref={pageRef} style={{ paddingTop: '30px', position: 'relative', zIndex: 1 }}>
      <PageHeader tag="Original Data Collection" tagColor="#e84393" title={<>🗳️ <span className="gradient-text">VOTE</span> MODE</>}
        subtitle={<>Vote on real LLM responses — your votes generate original research data.{count > 0 && <span style={{ color: '#00cec9', marginLeft: '12px' }}>✓ {count} votes this session</span>}</>}
        isMobile={isMobile} isTablet={isTablet} />
      <div ref={formRef} style={{ padding: bodyPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px', marginBottom: '16px' }}>
          <div><label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Model A</label><select className="glass-select" value={modelA} onChange={e => { if (e.target.value !== modelB) setModelA(e.target.value) }}>{models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelB}>{m.display}</option>)}</select></div>
          <div><label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Model B</label><select className="glass-select" value={modelB} onChange={e => { if (e.target.value !== modelA) setModelB(e.target.value) }}>{models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelA}>{m.display}</option>)}</select></div>
        </div>
        <textarea className="glass-textarea" style={{ height: '80px', marginBottom: '14px' }} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a prompt to generate responses to vote on..." />
        <button className="glass-btn glass-btn-primary" onClick={gen} disabled={loading} style={{ marginBottom: '28px', width: isMobile ? '100%' : undefined }}>{loading ? '⏳ Generating...' : '🎲 Generate Battle'}</button>

        <AnimatePresence mode="wait">
          {battle && (
            <motion.div key="vote-results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px', marginBottom: '16px' }}>
                {['a', 'b'].map((side, idx) => (
                  <motion.div key={side} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.15 }}
                    whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(108,92,231,0.12)' }}
                    className="glass-card" style={{ borderTop: `2px solid ${voted === side ? '#00cec940' : (side === 'a' ? 'rgba(108,92,231,0.3)' : 'rgba(232,67,147,0.3)')}` }}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: side === 'a' ? '#6c5ce7' : '#e84393', fontFamily: "'JetBrains Mono',monospace", marginBottom: '12px' }}>Response {side.toUpperCase()}</div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', maxHeight: '260px', overflowY: 'auto' }}>{side === 'a' ? battle.response_a : battle.response_b}</p>
                  </motion.div>
                ))}
              </div>
              {!voted ? (
                <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                  {[['a', '⬅ Model A', '#6c5ce7'], ['tie', '🤝 Tie', 'rgba(255,255,255,0.3)'], ['b', 'Model B ➡', '#e84393']].map(([v, l, c], i) => (
                    <motion.button key={v} onClick={() => vote(v)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="glass-btn" style={{ flex: 1, borderColor: `${c}40` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.boxShadow = `0 0 16px ${c}25` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${c}40`; e.currentTarget.style.boxShadow = 'none' }}>{l}</motion.button>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}
                  className="glass-card" style={{ textAlign: 'center', borderTop: '2px solid rgba(0,206,201,0.3)' }}>
                  <div style={{ color: '#00cec9', fontFamily: "'Inter',sans-serif", marginBottom: '10px', fontWeight: 500 }}>✅ Vote recorded! You chose: <strong style={{ textTransform: 'uppercase' }}>{voted}</strong></div>
                  <button className="glass-btn" style={{ padding: '8px 20px', fontSize: '0.72rem' }} onClick={() => { setBattle(null); setPrompt(''); setVoted(null) }}>Vote on another →</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// BIAS LAB
// ══════════════════════════════════════════════════════════════════════════════
export function Bias() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const pageRef = useRef(null), gridRef = useRef(null), cardsRef = useRef([]), barsRef = useRef([])

  const BIASES = [
    { name: 'Verbosity Bias', pct: 58, color: '#e84393', desc: 'Responses over 200 words win 58% more often regardless of quality. Humans judge effort over accuracy.', evidence: 'Word count was the #1 feature predicting winner in 55,000 battles.', fix: 'The Optimizer exploits this — adding length increases win probability by up to +28%.' },
    { name: 'Position Bias', pct: 54, color: '#6c5ce7', desc: 'Response A (shown first) wins 54% of the time when both are equal quality. Judges anchor to the first option.', evidence: 'Even-matched battles show 8% above-baseline win rate for first-position responses.', fix: 'Randomizing response display order in evaluation pipelines reduces this bias.' },
    { name: 'Structure Bias', pct: 76, color: '#fd79a8', desc: 'Responses with bullet points, code blocks, or headers are 2.3× more likely to be chosen over plain-text alternatives.', evidence: 'Adding 3 bullet points increased win probability by 19% on average.', fix: 'Structure bias is the most exploitable — our optimizer always adds structure when relevant.' },
    { name: 'Tie Rate', pct: 12, color: 'rgba(255,255,255,0.4)', desc: '12% of all battles result in a tie, concentrated in technical/factual prompts where both models perform similarly.', evidence: 'Tie rate rises to 22% for code-related prompts.', fix: 'Our model treats ties as a distinct class (3-way classification) rather than a fallback.' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      const cards = cardsRef.current.filter(Boolean)
      if (cards.length) gsap.fromTo(cards, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } })
      const bars = barsRef.current.filter(Boolean)
      bars.forEach((bar, i) => { gsap.fromTo(bar, { width: '0%' }, { width: `${BIASES[i].pct}%`, duration: 1.2, delay: 0.3 + i * 0.15, ease: 'power2.out', scrollTrigger: { trigger: gridRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } }) })
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'
  const gridCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <div ref={pageRef} style={{ paddingTop: '30px', position: 'relative', zIndex: 1 }}>
      <PageHeader tag="Research Findings" tagColor="#fd79a8" title={<>🔬 <span className="gradient-text">BIAS DETECTION</span> LAB</>}
        subtitle="Original research findings from analyzing 55,000 human preference votes from Chatbot Arena." isMobile={isMobile} isTablet={isTablet} />
      <div style={{ padding: bodyPad }}>
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '20px' }}>
          {BIASES.map((b, i) => (
            <motion.div key={b.name} ref={el => (cardsRef.current[i] = el)}
              whileHover={{ y: -6, scale: 1.01, boxShadow: `0 16px 48px ${b.color}20` }}
              transition={{ duration: 0.25 }}
              className="glass-card" style={{ borderTop: `3px solid ${b.color}50`, opacity: 0, cursor: 'default' }}>
              <div className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{b.pct}%</div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.01em', marginBottom: '12px' }}>{b.name}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>{b.desc}</p>
              <div className="glass-subtle" style={{ padding: '12px 14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>Evidence</div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>{b.evidence}</p>
              </div>
              <div style={{ background: `${b.color}10`, border: `1px solid ${b.color}20`, padding: '12px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: b.color, fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>How We Use It</div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>{b.fix}</p>
              </div>
              <div style={{ marginTop: '18px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)' }}>
                <div ref={el => (barsRef.current[i] = el)} style={{ height: '100%', width: '0%', borderRadius: '3px', background: `linear-gradient(90deg, ${b.color}, ${b.color}66)`, boxShadow: `0 0 10px ${b.color}30` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// OPTIMIZER
// ══════════════════════════════════════════════════════════════════════════════
export function Optimizer() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [model, setModel] = useState('llama-3.3-70b-versatile')
  const [models, setModels] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const pageRef = useRef(null), leftRef = useRef(null), rightRef = useRef(null)

  useEffect(() => { getModels().then(r => setModels(r.data.models.filter(m => m.free))).catch(() => {}) }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      gsap.fromTo(leftRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' })
      gsap.fromTo(rightRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.45, ease: 'power2.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handle = async () => { if (!prompt.trim() || !response.trim()) return; setLoading(true); setResult(null); try { const r = await optimizeResponse(response, prompt, model); setResult(r.data) } finally { setLoading(false) } }

  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'
  const mainCols = (isMobile || isTablet) ? '1fr' : '1fr 1fr'

  return (
    <div ref={pageRef} style={{ paddingTop: '30px', position: 'relative', zIndex: 1 }}>
      <PageHeader tag="Ethical AI" tagColor="#fdcb6e" title={<>⚡ <span className="gradient-text">ADVERSARIAL</span> OPTIMIZER</>}
        subtitle="Paste any AI response and we'll rewrite it to maximize its predicted win probability — by exploiting the biases we discovered." isMobile={isMobile} isTablet={isTablet} />
      <div style={{ padding: bodyPad }}>
        <div style={{ display: 'grid', gridTemplateColumns: mainCols, gap: '32px' }}>
          <div ref={leftRef} style={{ opacity: 0 }}>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Original Prompt</label><textarea className="glass-textarea" style={{ height: '80px' }} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The original question asked to the AI..." /></div>
            <div style={{ marginBottom: '14px' }}><label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Response to Optimize</label><textarea className="glass-textarea" style={{ height: '150px' }} value={response} onChange={e => setResponse(e.target.value)} placeholder="Paste any AI response here — we'll make it win..." /></div>
            <div style={{ marginBottom: '18px' }}><label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Optimizer Model</label><select className="glass-select" value={model} onChange={e => setModel(e.target.value)}>{models.map(m => <option key={m.id} value={m.id}>{m.display}</option>)}</select></div>
            <button className="glass-btn glass-btn-primary" onClick={handle} disabled={loading} style={{ width: '100%' }}>{loading ? '⏳ Optimizing...' : '⚡ Optimize to Win'}</button>
          </div>
          <div ref={rightRef} style={{ opacity: 0 }}>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="opt-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                    {[{ l: 'Original', v: `${(result.original_win_prob * 100).toFixed(0)}%`, c: '#e84393' }, { l: 'Optimized', v: `${(result.optimized_win_prob * 100).toFixed(0)}%`, c: '#00cec9' }, { l: 'Improvement', v: `+${result.improvement_pct}%`, c: '#fdcb6e' }].map((m, i) => (
                      <motion.div key={m.l} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                        whileHover={{ y: -3 }}
                        className="glass-card" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '2rem', fontWeight: 700 }}>{m.v}</div>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginTop: '4px' }}>{m.l}</div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="glass-card" style={{ borderTop: '2px solid rgba(0,206,201,0.3)', maxHeight: '320px', overflowY: 'auto', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00cec9', fontFamily: "'JetBrains Mono',monospace", marginBottom: '10px' }}>⚡ Optimized Response</div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap' }}>{result.optimized_response}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="glass-subtle" style={{ padding: '14px', borderLeft: '3px solid rgba(253,203,110,0.4)' }}>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fdcb6e', fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>🤔 Ethical Note</div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>The optimized response may win more often — but is it actually better quality? This demonstrates that RLHF reward models can be gamed by exploiting human cognitive biases.</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="opt-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="glass" style={{ textAlign: 'center', padding: '60px 28px', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '14px' }}>⚡</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', lineHeight: '1.7' }}>
                    Paste a response and click Optimize.<br />We'll exploit verbosity, structure, and readability biases.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════════════════════════════════════
export function Leaderboard() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const pageRef = useRef(null), tableRef = useRef(null), barsRef = useRef([])

  useEffect(() => { getLeaderboard().then(r => { setData(r.data.leaderboard); setLoading(false) }).catch(() => setLoading(false)) }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tbody tr')
        if (rows.length) gsap.fromTo(rows, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'power2.out', scrollTrigger: { trigger: tableRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' } })
        const medals = tableRef.current.querySelectorAll('[data-medal]')
        if (medals.length) gsap.fromTo(medals, { scale: 0 }, { scale: 1, stagger: 0.06, duration: 0.4, ease: 'back.out(1.7)', delay: 0.2 })
      }
      const bars = barsRef.current.filter(Boolean)
      bars.forEach((bar, i) => { gsap.fromTo(bar, { width: '0%' }, { width: `${bar.dataset.rate}%`, duration: 0.8, delay: 0.3 + i * 0.05, ease: 'power2.out' }) })
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, pageRef)
    return () => ctx.revert()
  }, [loading])

  const medalBg = rank => rank === 1 ? 'linear-gradient(135deg, #fdcb6e, #ffeaa7)' : rank === 2 ? 'linear-gradient(135deg, #b2bec3, #dfe6e9)' : rank === 3 ? 'linear-gradient(135deg, #e17055, #fab1a0)' : 'rgba(255,255,255,0.08)'
  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'

  return (
    <div ref={pageRef} style={{ paddingTop: '30px', position: 'relative', zIndex: 1 }}>
      <PageHeader tag="ELO Rankings" tagColor="#fdcb6e" title={<>🏆 <span className="gradient-text">MODEL</span> LEADERBOARD</>}
        subtitle="Chess-style ELO ratings based on actual battle outcomes. Updated in real time after every human vote." isMobile={isMobile} isTablet={isTablet} />
      <div style={{ padding: bodyPad }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="lb-load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass" style={{ textAlign: 'center', padding: '60px', borderRadius: '20px', color: 'rgba(255,255,255,0.4)' }}>Loading leaderboard...</motion.div>
          ) : data.length === 0 ? (
            <motion.div key="lb-empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}
              className="glass" style={{ textAlign: 'center', padding: '60px', borderRadius: '20px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏆</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif", fontSize: '0.85rem' }}>
                No battles yet. Fight in the Arena and vote to populate the leaderboard!
              </div>
            </motion.div>
          ) : (
            <motion.div key="lb-table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div ref={tableRef} className="glass-card" style={{ overflow: 'hidden', overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Rank', 'Model', 'ELO', 'Wins', 'Losses', 'Ties', 'Win Rate'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace", borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={row.model} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 18px' }}>
                          <div data-medal style={{ width: '34px', height: '34px', borderRadius: '50%', background: medalBg(row.rank), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins',sans-serif", fontSize: '0.85rem', fontWeight: 700, color: row.rank <= 3 ? '#2d3436' : 'rgba(255,255,255,0.5)', transform: 'scale(0)', boxShadow: row.rank <= 3 ? `0 0 12px ${row.rank === 1 ? 'rgba(253,203,110,0.4)' : 'rgba(255,255,255,0.15)'}` : undefined }}>{row.rank}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', color: '#e4e8f1' }}>{row.model}</td>
                        <td style={{ padding: '14px 18px' }}><span className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.3rem', fontWeight: 700 }}>{row.elo}</span></td>
                        <td style={{ padding: '14px 18px', color: '#00cec9', fontFamily: "'JetBrains Mono',monospace" }}>{row.wins}</td>
                        <td style={{ padding: '14px 18px', color: '#e84393', fontFamily: "'JetBrains Mono',monospace" }}>{row.losses}</td>
                        <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace" }}>{row.ties}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '70px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                              <div ref={el => (barsRef.current[i] = el)} data-rate={row.win_rate} style={{ height: '100%', width: '0%', borderRadius: '3px', background: 'linear-gradient(90deg, #00cec9, #6c5ce7)', boxShadow: '0 0 8px rgba(0,206,201,0.3)' }} />
                            </div>
                            <span style={{ fontSize: '0.76rem', color: '#00cec9', fontFamily: "'JetBrains Mono',monospace" }}>{row.win_rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
