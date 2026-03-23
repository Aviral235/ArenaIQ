import { useState, useEffect, useRef } from 'react'
import { runBattle, submitArenaVote, getModels } from '../api'
import { ProbBar, ExplainBox } from '../components/ProbBar'
import gsap from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

const fadeSlide = { initial: { opacity: 0, y: 25 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -15 }, transition: { duration: 0.45, ease: 'easeOut' } }

export default function Arena() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const [prompt, setPrompt] = useState('')
  const [modelA, setModelA] = useState('gemini-2.5-flash')
  const [modelB, setModelB] = useState('llama-3.3-70b-versatile')
  const [models, setModels] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(null)
  const [voteMsg, setVoteMsg] = useState('')
  const [error, setError] = useState('')

  const pageRef = useRef(null), tagRef = useRef(null), h1Ref = useRef(null), subRef = useRef(null), formRef = useRef(null)

  useEffect(() => {
    getModels().then(r => {
      const list = r.data.models; setModels(list)
      const ids = list.map(m => m.id)
      if (ids.includes('gemini-2.5-flash')) setModelA('gemini-2.5-flash'); else if (ids.length > 0) setModelA(ids[0])
      if (ids.includes('llama-3.3-70b-versatile')) setModelB('llama-3.3-70b-versatile'); else if (ids.length > 1) setModelB(ids[1])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(tagRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0.1)
      tl.fromTo(h1Ref.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7 }, 0.2)
      tl.fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.4)
      if (formRef.current) tl.fromTo(formRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, 0.5)
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const handleBattle = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return }
    if (modelA === modelB) { setError('Please choose two different models'); return }
    setError(''); setLoading(true); setResult(null); setVoted(null); setVoteMsg('')
    try { const r = await runBattle(prompt, modelA, modelB); setResult(r.data) }
    catch (e) { setError('Error: ' + (e.response?.data?.detail || e.message)) }
    finally { setLoading(false) }
  }

  const handleVote = async (winner) => {
    if (!result || voted) return
    try { const r = await submitArenaVote(result.battle_id, winner); setVoted(winner); setVoteMsg(r.data.prediction_was_correct ? '✅ Model predicted correctly!' : '❌ Model was wrong this time.') } catch {}
  }

  const wc = side => (result && result.predicted_winner === side) ? '#00cec9' : 'rgba(255,255,255,0.1)'
  const hdrPad = isMobile ? '40px 20px 28px' : isTablet ? '46px 32px 32px' : '52px 64px 36px'
  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'
  const selCols = isMobile ? '1fr' : '1fr auto 1fr'
  const resCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <div ref={pageRef} style={{ paddingTop: '30px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ padding: hdrPad }}>
        <div ref={tagRef} className="section-label" style={{ color: '#6c5ce7', opacity: 0 }}>Live Arena</div>
        <h1 ref={h1Ref} style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(2.5rem,5vw,3.5rem)', fontWeight: 800, lineHeight: '0.95', clipPath: 'inset(0 100% 0 0)' }}>
          ⚔️ <span className="gradient-text">AI BATTLE</span> ARENA
        </h1>
        <p ref={subRef} style={{ color: 'rgba(255,255,255,0.5)', marginTop: '12px', fontSize: '0.95rem', opacity: 0, fontWeight: 300 }}>
          Enter a prompt → two LLMs respond → ML predicts who wins → you vote <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>(Ctrl+Enter to start)</span>
        </p>
      </div>

      <div ref={formRef} style={{ padding: bodyPad }}>
        {/* Model selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: selCols, gap: '16px', marginBottom: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Model A</label>
            <select className="glass-select" value={modelA} onChange={e => { if (e.target.value !== modelB) { setError(''); setModelA(e.target.value) } else setError('Choose two different models') }}>
              {models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelB}>{m.display}{m.free ? ' (free)' : ' (paid)'}</option>)}
            </select>
          </div>
          {!isMobile && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '6px' }}><span className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>VS</span></div>}
          <div>
            <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Model B</label>
            <select className="glass-select" value={modelB} onChange={e => { if (e.target.value !== modelA) { setError(''); setModelB(e.target.value) } else setError('Choose two different models') }}>
              {models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelA}>{m.display}{m.free ? ' (free)' : ' (paid)'}</option>)}
            </select>
          </div>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }}>Your Prompt</label>
          <textarea className="glass-textarea" style={{ height: '90px' }} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleBattle() }} placeholder="e.g. Explain quantum entanglement to a 10-year-old..." />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button className="glass-btn glass-btn-primary" onClick={handleBattle} disabled={loading}>{loading ? '⏳ Battling...' : '⚔️ Start Battle'}</button>
          <button className="glass-btn" onClick={() => { setResult(null); setPrompt(''); setVoted(null); setError('') }}>Clear</button>
          {error && <span style={{ color: '#e84393', fontSize: '0.82rem', fontFamily: "'JetBrains Mono',monospace" }}>{error}</span>}
        </div>

        {/* Loading */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" {...fadeSlide} className="glass" style={{ textAlign: 'center', padding: '60px', borderRadius: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>Calling both models in parallel...</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>(Gemini free tier may take 5-10 seconds)</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              {/* Prediction */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-card" style={{ marginBottom: '20px', borderTop: '2px solid rgba(108,92,231,0.4)' }}>
                <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a29bfe', fontFamily: "'JetBrains Mono',monospace", marginBottom: '14px', display: 'block' }}>🧠 ML Prediction</label>
                <ProbBar label="Model A" value={result.prob_a} color="#6c5ce7" delay={100} />
                <ProbBar label="Model B" value={result.prob_b} color="#e84393" delay={250} />
                <ProbBar label="Tie" value={result.prob_tie} color="rgba(255,255,255,0.4)" delay={400} />
                <ExplainBox explanation={result.explanation} shap={result.shap_features} />
              </motion.div>

              {/* Response cards */}
              <div style={{ display: 'grid', gridTemplateColumns: resCols, gap: '16px', marginBottom: '20px' }}>
                {['a', 'b'].map((side, idx) => {
                  const isErr = (side === 'a' ? result.response_a : result.response_b).startsWith('[')
                  return (
                    <motion.div key={side} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 + idx * 0.15 }}
                      whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(108,92,231,0.12)` }}
                      className="glass-card" style={{ borderColor: wc(side) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <span className="glass-tag" style={{ color: side === 'a' ? '#6c5ce7' : '#e84393', borderColor: side === 'a' ? 'rgba(108,92,231,0.3)' : 'rgba(232,67,147,0.3)' }}>
                          {side === 'a' ? result.model_a : result.model_b}
                        </span>
                        {result.predicted_winner === side && (
                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                            style={{ color: '#00cec9', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace" }}>⭐ PREDICTED WINNER</motion.span>
                        )}
                      </div>
                      {isErr ? (
                        <div className="glass-subtle" style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#e84393', fontFamily: "'JetBrains Mono',monospace", marginBottom: '6px' }}>⚠️ API ERROR</div>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{side === 'a' ? result.response_a : result.response_b}</p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>Check backend/.env for valid API key, or choose a different model.</p>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>{side === 'a' ? result.response_a : result.response_b}</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Vote */}
              {!voted ? (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="glass-card">
                  <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginBottom: '12px', display: 'block' }}>🗳️ Which response do YOU prefer?</label>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                    {[['a', '⬅ Model A', '#6c5ce7'], ['tie', '🤝 Tie', 'rgba(255,255,255,0.3)'], ['b', 'Model B ➡', '#e84393']].map(([v, l, c], i) => (
                      <motion.button key={v} onClick={() => handleVote(v)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                        className="glass-btn" style={{ flex: 1, borderColor: `${c}40` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.boxShadow = `0 0 16px ${c}25` }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${c}40`; e.currentTarget.style.boxShadow = 'none' }}>{l}</motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, type: 'spring' }}
                  className="glass-card" style={{ textAlign: 'center', padding: '28px' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{voteMsg.startsWith('✅') ? '🎯' : '🤔'}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.9rem', fontWeight: 500 }}>{voteMsg}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', marginTop: '8px', fontSize: '0.82rem' }}>
                    You voted: <strong style={{ color: '#e4e8f1', textTransform: 'uppercase' }}>{voted}</strong>
                    &nbsp;· Predicted: <strong className="gradient-text" style={{ textTransform: 'uppercase' }}>{result.predicted_winner}</strong>
                  </div>
                  <button className="glass-btn" style={{ marginTop: '14px', fontSize: '0.72rem', padding: '8px 20px' }} onClick={() => { setResult(null); setPrompt(''); setVoted(null) }}>New Battle →</button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
