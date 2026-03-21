import { useState, useEffect } from 'react'
import { runBattle, submitArenaVote, getModels } from '../api'
import { ProbBar, ExplainBox } from '../components/ProbBar'

const S = {
  page: { paddingTop: '80px', minHeight: '100vh' },
  hdr:  { padding: '52px 64px 36px', borderBottom: '1px solid #1e2d4a' },
  tag:  { fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00e5ff', fontFamily: "'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  h1:   { fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.8rem,5vw,4rem)', lineHeight: '0.9' },
  body: { padding: '36px 64px' },
  card: { background: '#111827', border: '1px solid #1e2d4a', padding: '26px' },
  lbl:  { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' },
  sel:  { background: '#0c1022', border: '1px solid #1e2d4a', color: '#e8edf5', padding: '10px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', outline: 'none', width: '100%', cursor: 'pointer' },
  ta:   { background: '#0c1022', border: '1px solid #1e2d4a', color: '#e8edf5', padding: '14px 16px', fontFamily: "'DM Sans',sans-serif", fontSize: '0.92rem', resize: 'none', outline: 'none', width: '100%', lineHeight: '1.7' },
  btnP: { background: '#00e5ff', color: '#000', border: 'none', padding: '13px 28px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', fontWeight: 500 },
  btnG: { background: 'transparent', color: '#e8edf5', border: '1px solid #1e2d4a', padding: '13px 28px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' },
}

export default function Arena() {
  const [prompt, setPrompt]   = useState('')
  const [modelA, setModelA]   = useState('gemini-2.5-flash')
  const [modelB, setModelB]   = useState('llama-3.3-70b-versatile')
  const [models, setModels]   = useState([])
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted]     = useState(null)
  const [voteMsg, setVoteMsg] = useState('')
  const [error, setError]     = useState('')

  useEffect(() => {
    getModels().then(r => {
      const list = r.data.models
      setModels(list)
      const ids = list.map(m => m.id)
      if (ids.includes('gemini-2.5-flash'))        setModelA('gemini-2.5-flash')
      else if (ids.length > 0)                     setModelA(ids[0])
      if (ids.includes('llama-3.3-70b-versatile')) setModelB('llama-3.3-70b-versatile')
      else if (ids.length > 1)                     setModelB(ids[1])
    }).catch(() => {})
  }, [])

  const handleBattle = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return }
    if (modelA === modelB) { setError('Please choose two different models'); return }
    setError(''); setLoading(true); setResult(null); setVoted(null); setVoteMsg('')
    try {
      const r = await runBattle(prompt, modelA, modelB)
      setResult(r.data)
    } catch (e) {
      setError('Error: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (winner) => {
    if (!result || voted) return
    try {
      const r = await submitArenaVote(result.battle_id, winner)
      setVoted(winner)
      setVoteMsg(r.data.prediction_was_correct
        ? '✅ Model predicted correctly!'
        : '❌ Model was wrong this time.')
    } catch {}
  }

  const wc = side => (result && result.predicted_winner === side) ? '#10b981' : '#1e2d4a'

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={S.tag}><span style={{ width: '20px', height: '1px', background: '#00e5ff', display: 'block' }} />Live Arena</div>
        <h1 style={S.h1}>⚔️ AI BATTLE ARENA</h1>
        <p style={{ color: '#6b7a9a', marginTop: '10px', fontSize: '0.95rem' }}>
          Enter a prompt → two LLMs respond → ML predicts who wins → you vote &nbsp;
          <span style={{ color: '#4a5568', fontSize: '0.82rem' }}>(Ctrl+Enter to start)</span>
        </p>
      </div>

      <div style={S.body}>
        {/* Model selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', marginBottom: '20px', alignItems: 'end' }}>
          <div>
            <label style={S.lbl}>Model A</label>
            <select style={S.sel} value={modelA} onChange={e => { if (e.target.value !== modelB) { setError(''); setModelA(e.target.value) } else setError('Choose two different models') }}>
              {models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelB}>{m.display}{m.free ? ' (free)' : ' (paid)'}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '4px' }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', color: '#1e2d4a' }}>VS</span>
          </div>
          <div>
            <label style={S.lbl}>Model B</label>
            <select style={S.sel} value={modelB} onChange={e => { if (e.target.value !== modelA) { setError(''); setModelB(e.target.value) } else setError('Choose two different models') }}>
              {models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelA}>{m.display}{m.free ? ' (free)' : ' (paid)'}</option>)}
            </select>
          </div>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: '18px' }}>
          <label style={S.lbl}>Your Prompt</label>
          <textarea
            style={{ ...S.ta, height: '90px' }}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleBattle() }}
            placeholder="e.g. Explain quantum entanglement to a 10-year-old..."
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button style={S.btnP} onClick={handleBattle} disabled={loading}>
            {loading ? '⏳ Battling...' : '⚔️ Start Battle'}
          </button>
          <button style={S.btnG} onClick={() => { setResult(null); setPrompt(''); setVoted(null); setError('') }}>
            Clear
          </button>
          {error && <span style={{ color: '#ef4444', fontSize: '0.82rem', fontFamily: "'JetBrains Mono',monospace" }}>{error}</span>}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7a9a', border: '1px solid #1e2d4a', background: '#0c1022' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.08em' }}>
              Calling both models in parallel...
            </div>
            <div style={{ fontSize: '0.72rem', color: '#4a5568', marginTop: '8px' }}>
              (Gemini free tier may take 5-10 seconds)
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Prediction */}
            <div style={{ ...S.card, marginBottom: '20px', borderTopColor: '#00e5ff', borderTopWidth: '2px' }}>
              <label style={{ ...S.lbl, color: '#00e5ff', marginBottom: '14px' }}>🧠 ML Prediction</label>
              <ProbBar label="Model A" value={result.prob_a}   color="#00e5ff" delay={100} />
              <ProbBar label="Model B" value={result.prob_b}   color="#f26d2d" delay={250} />
              <ProbBar label="Tie"     value={result.prob_tie} color="#6b7a9a" delay={400} />
              <ExplainBox explanation={result.explanation} shap={result.shap_features} />
            </div>

            {/* Response cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {['a', 'b'].map(side => {
                const isError = (side === 'a' ? result.response_a : result.response_b).startsWith('[')
                return (
                  <div key={side} style={{ ...S.card, borderColor: wc(side), transition: 'border-color 0.4s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px',
                        background: side === 'a' ? 'rgba(0,229,255,0.1)' : 'rgba(242,109,45,0.1)',
                        color: side === 'a' ? '#00e5ff' : '#f26d2d',
                        border: `1px solid ${side === 'a' ? 'rgba(0,229,255,0.2)' : 'rgba(242,109,45,0.2)'}`,
                      }}>
                        {side === 'a' ? result.model_a : result.model_b}
                      </span>
                      {result.predicted_winner === side && (
                        <span style={{ color: '#10b981', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace" }}>
                          ⭐ PREDICTED WINNER
                        </span>
                      )}
                    </div>
                    {isError ? (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px', borderRadius: '2px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#ef4444', fontFamily: "'JetBrains Mono',monospace", marginBottom: '6px' }}>⚠️ API ERROR</div>
                        <p style={{ fontSize: '0.82rem', color: '#a0aec0', lineHeight: '1.6' }}>
                          {side === 'a' ? result.response_a : result.response_b}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#6b7a9a', marginTop: '8px' }}>
                          Check backend/.env for valid API key, or choose a different model.
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: '#a0aec0', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                        {side === 'a' ? result.response_a : result.response_b}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Vote */}
            {!voted ? (
              <div style={S.card}>
                <label style={S.lbl}>🗳️ Which response do YOU prefer?</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  {[['a', '⬅ Model A', '#00e5ff'], ['tie', '🤝 Tie', '#6b7a9a'], ['b', 'Model B ➡', '#f26d2d']].map(([v, l, c]) => (
                    <button key={v} onClick={() => handleVote(v)} style={{
                      flex: 1, padding: '14px', cursor: 'pointer',
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '0.76rem',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: 'transparent', color: '#e8edf5',
                      border: `1px solid ${c}`, transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${c}18` }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ ...S.card, textAlign: 'center', padding: '28px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{voteMsg.startsWith('✅') ? '🎯' : '🤔'}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem' }}>{voteMsg}</div>
                <div style={{ color: '#6b7a9a', marginTop: '8px', fontSize: '0.82rem' }}>
                  You voted: <strong style={{ color: '#e8edf5', textTransform: 'uppercase' }}>{voted}</strong>
                  &nbsp;· Predicted: <strong style={{ color: '#00e5ff', textTransform: 'uppercase' }}>{result.predicted_winner}</strong>
                </div>
                <button style={{ ...S.btnG, marginTop: '14px', fontSize: '0.72rem', padding: '8px 20px' }}
                  onClick={() => { setResult(null); setPrompt(''); setVoted(null) }}>
                  New Battle →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
