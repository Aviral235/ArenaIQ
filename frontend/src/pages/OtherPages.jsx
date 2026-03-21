import { useState, useEffect } from 'react'
import { getModels, runBattle, submitHumanVote, optimizeResponse, getLeaderboard } from '../api'

const CARD = { background: '#111827', border: '1px solid #1e2d4a', padding: '26px' }
const LBL  = { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginBottom: '8px', display: 'block' }
const SEL  = { background: '#0c1022', border: '1px solid #1e2d4a', color: '#e8edf5', padding: '10px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', outline: 'none', width: '100%', cursor: 'pointer' }
const TA   = (h = '80px') => ({ background: '#0c1022', border: '1px solid #1e2d4a', color: '#e8edf5', padding: '14px 16px', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', resize: 'none', outline: 'none', width: '100%', height: h, lineHeight: '1.7' })
const BTN  = (bg, fg = '#000') => ({ background: bg, color: fg, border: 'none', padding: '13px 28px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 })

function PageHeader({ tag, tagColor, title, subtitle }) {
  return (
    <div style={{ padding: '52px 64px 36px', borderBottom: '1px solid #1e2d4a' }}>
      <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: tagColor, fontFamily: "'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ width: '20px', height: '1px', background: tagColor, display: 'block' }} />{tag}
      </div>
      <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.8rem,5vw,4rem)', lineHeight: '0.9' }}>{title}</h1>
      {subtitle && <p style={{ color: '#6b7a9a', marginTop: '10px', maxWidth: '600px', fontSize: '0.95rem' }}>{subtitle}</p>}
    </div>
  )
}

// ── VOTE ──────────────────────────────────────────────────────────────────────
export function Vote() {
  const [prompt,  setPrompt]  = useState('')
  const [modelA,  setModelA]  = useState('gemini-2.5-flash')
  const [modelB,  setModelB]  = useState('llama-3.3-70b-versatile')
  const [models,  setModels]  = useState([])
  const [battle,  setBattle]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [voted,   setVoted]   = useState(null)
  const [count,   setCount]   = useState(0)

  useEffect(() => { getModels().then(r => setModels(r.data.models)).catch(() => {}) }, [])

  const gen = async () => {
    if (!prompt.trim()) return
    setLoading(true); setBattle(null); setVoted(null)
    try { const r = await runBattle(prompt, modelA, modelB); setBattle(r.data) }
    finally { setLoading(false) }
  }

  const vote = async (winner) => {
    if (!battle || voted) return
    await submitHumanVote({ battle_id: battle.battle_id, prompt, response_a: battle.response_a, response_b: battle.response_b, winner, model_a: modelA, model_b: modelB })
    setVoted(winner); setCount(c => c + 1)
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <PageHeader tag="Original Data Collection" tagColor="#f26d2d" title="🗳️ VOTE MODE"
        subtitle={<>Vote on real LLM responses — your votes generate original research data.{count > 0 && <span style={{ color: '#10b981', marginLeft: '12px' }}>✓ {count} votes this session</span>}</>} />
      <div style={{ padding: '36px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={LBL}>Model A</label><select style={SEL} value={modelA} onChange={e => { if (e.target.value !== modelB) setModelA(e.target.value) }}>{models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelB}>{m.display}</option>)}</select></div>
          <div><label style={LBL}>Model B</label><select style={SEL} value={modelB} onChange={e => { if (e.target.value !== modelA) setModelB(e.target.value) }}>{models.map(m => <option key={m.id} value={m.id} disabled={m.id === modelA}>{m.display}</option>)}</select></div>
        </div>
        <textarea style={TA('80px')} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a prompt to generate responses to vote on..." />
        <button style={{ ...BTN('#f26d2d'), marginTop: '14px', marginBottom: '28px' }} onClick={gen} disabled={loading}>{loading ? '⏳ Generating...' : '🎲 Generate Battle'}</button>

        {battle && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {['a', 'b'].map(side => (
                <div key={side} style={{ ...CARD, borderTopColor: voted === side ? '#10b981' : '#1e2d4a', borderTopWidth: '2px' }}>
                  <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: side === 'a' ? '#00e5ff' : '#f26d2d', fontFamily: "'JetBrains Mono',monospace", marginBottom: '10px' }}>Response {side.toUpperCase()}</div>
                  <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: '#a0aec0', whiteSpace: 'pre-wrap', maxHeight: '260px', overflowY: 'auto' }}>{side === 'a' ? battle.response_a : battle.response_b}</p>
                </div>
              ))}
            </div>
            {!voted ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                {[['a', '⬅ Model A', '#00e5ff'], ['tie', '🤝 Tie', '#6b7a9a'], ['b', 'Model B ➡', '#f26d2d']].map(([v, l, c]) => (
                  <button key={v} onClick={() => vote(v)} style={{ flex: 1, padding: '14px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'transparent', color: '#e8edf5', border: `1px solid ${c}`, transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${c}18` }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>{l}</button>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#10b981', fontFamily: "'JetBrains Mono',monospace", marginBottom: '10px' }}>✅ Vote recorded! You chose: <strong>{voted.toUpperCase()}</strong></div>
                <button style={{ ...BTN('#1e2d4a', '#6b7a9a'), border: '1px solid #1e2d4a' }} onClick={() => { setBattle(null); setPrompt(''); setVoted(null) }}>Vote on another →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── BIAS LAB ──────────────────────────────────────────────────────────────────
export function Bias() {
  const BIASES = [
    { name: 'Verbosity Bias', pct: 58, color: '#f26d2d', desc: 'Responses over 200 words win 58% more often regardless of quality. Humans judge effort over accuracy.', evidence: 'Word count was the #1 feature predicting winner in 55,000 battles.', fix: 'The Optimizer exploits this — adding length increases win probability by up to +28%.' },
    { name: 'Position Bias',  pct: 54, color: '#00e5ff', desc: 'Response A (shown first) wins 54% of the time when both are equal quality. Judges anchor to the first option.', evidence: 'Even-matched battles show 8% above-baseline win rate for first-position responses.', fix: 'Randomizing response display order in evaluation pipelines reduces this bias.' },
    { name: 'Structure Bias', pct: 76, color: '#ef4444', desc: 'Responses with bullet points, code blocks, or headers are 2.3× more likely to be chosen over plain-text alternatives.', evidence: 'Adding 3 bullet points increased win probability by 19% on average.', fix: 'Structure bias is the most exploitable — our optimizer always adds structure when relevant.' },
    { name: 'Tie Rate',       pct: 12, color: '#6b7a9a', desc: '12% of all battles result in a tie, concentrated in technical/factual prompts where both models perform similarly.', evidence: 'Tie rate rises to 22% for code-related prompts.', fix: 'Our model treats ties as a distinct class (3-way classification) rather than a fallback.' },
  ]
  return (
    <div style={{ paddingTop: '80px' }}>
      <PageHeader tag="Research Findings" tagColor="#ef4444" title="🔬 BIAS DETECTION LAB" subtitle="Original research findings from analyzing 55,000 human preference votes from Chatbot Arena." />
      <div style={{ padding: '36px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {BIASES.map(b => (
            <div key={b.name} style={{ ...CARD, borderTop: `4px solid ${b.color}` }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '5rem', lineHeight: 1, color: b.color, marginBottom: '4px' }}>{b.pct}%</div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em', marginBottom: '10px' }}>{b.name}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: '#a0aec0', marginBottom: '14px' }}>{b.desc}</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2d4a', padding: '12px 14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>Evidence</div>
                <p style={{ fontSize: '0.82rem', color: '#6b7a9a', lineHeight: '1.5' }}>{b.evidence}</p>
              </div>
              <div style={{ background: `${b.color}0d`, border: `1px solid ${b.color}22`, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: b.color, fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>How We Use It</div>
                <p style={{ fontSize: '0.82rem', color: '#6b7a9a', lineHeight: '1.5' }}>{b.fix}</p>
              </div>
              <div style={{ marginTop: '18px', height: '5px', background: '#0c1022' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── OPTIMIZER ─────────────────────────────────────────────────────────────────
export function Optimizer() {
  const [prompt,   setPrompt]   = useState('')
  const [response, setResponse] = useState('')
  const [model,    setModel]    = useState('llama-3.3-70b-versatile')
  const [models,   setModels]   = useState([])
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { getModels().then(r => setModels(r.data.models.filter(m => m.free))).catch(() => {}) }, [])

  const handle = async () => {
    if (!prompt.trim() || !response.trim()) return
    setLoading(true); setResult(null)
    try { const r = await optimizeResponse(response, prompt, model); setResult(r.data) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <PageHeader tag="Ethical AI" tagColor="#f59e0b" title="⚡ ADVERSARIAL OPTIMIZER"
        subtitle="Paste any AI response and we'll rewrite it to maximize its predicted win probability — by exploiting the biases we discovered." />
      <div style={{ padding: '36px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <div style={{ marginBottom: '14px' }}><label style={LBL}>Original Prompt</label><textarea style={TA('80px')} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The original question asked to the AI..." /></div>
            <div style={{ marginBottom: '14px' }}><label style={LBL}>Response to Optimize</label><textarea style={TA('150px')} value={response} onChange={e => setResponse(e.target.value)} placeholder="Paste any AI response here — we'll make it win..." /></div>
            <div style={{ marginBottom: '18px' }}><label style={LBL}>Optimizer Model</label><select style={SEL} value={model} onChange={e => setModel(e.target.value)}>{models.map(m => <option key={m.id} value={m.id}>{m.display}</option>)}</select></div>
            <button style={{ ...BTN('#f59e0b'), width: '100%' }} onClick={handle} disabled={loading}>{loading ? '⏳ Optimizing...' : '⚡ Optimize to Win'}</button>
          </div>
          <div>
            {result ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  {[{ l: 'Original', v: `${(result.original_win_prob * 100).toFixed(0)}%`, c: '#ef4444' }, { l: 'Optimized', v: `${(result.optimized_win_prob * 100).toFixed(0)}%`, c: '#10b981' }, { l: 'Improvement', v: `+${result.improvement_pct}%`, c: '#f59e0b' }].map(m => (
                    <div key={m.l} style={{ ...CARD, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginTop: '4px' }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#0d1421', border: '1px solid rgba(16,185,129,0.2)', borderTop: '2px solid #10b981', padding: '18px', maxHeight: '320px', overflowY: 'auto', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', fontFamily: "'JetBrains Mono',monospace", marginBottom: '10px' }}>⚡ Optimized Response</div>
                  <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: '#a0aec0', whiteSpace: 'pre-wrap' }}>{result.optimized_response}</p>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', padding: '14px' }}>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', fontFamily: "'JetBrains Mono',monospace", marginBottom: '5px' }}>🤔 Ethical Note</div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7a9a', lineHeight: '1.6' }}>The optimized response may win more often — but is it actually better quality? This demonstrates that RLHF reward models can be gamed by exploiting human cognitive biases.</p>
                </div>
              </>
            ) : (
              <div style={{ ...CARD, textAlign: 'center', padding: '60px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>⚡</div>
                <div style={{ color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', lineHeight: '1.7' }}>
                  Paste a response and click Optimize.<br />We'll exploit verbosity, structure, and readability biases.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
export function Leaderboard() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getLeaderboard().then(r => { setData(r.data.leaderboard); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const medalColor = rank => rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : rank === 3 ? '#b45309' : '#1e2d4a'

  return (
    <div style={{ paddingTop: '80px' }}>
      <PageHeader tag="ELO Rankings" tagColor="#f59e0b" title="🏆 MODEL LEADERBOARD" subtitle="Chess-style ELO ratings based on actual battle outcomes. Updated in real time after every human vote." />
      <div style={{ padding: '36px 64px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7a9a' }}>Loading leaderboard...</div>
        ) : data.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏆</div>
            <div style={{ color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem' }}>
              No battles yet. Fight in the Arena and vote to populate the leaderboard!
            </div>
          </div>
        ) : (
          <div style={{ background: '#111827', border: '1px solid #1e2d4a', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0c1022' }}>
                  {['Rank', 'Model', 'ELO', 'Wins', 'Losses', 'Ties', 'Win Rate'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '13px 18px', fontSize: '0.63rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", borderBottom: '1px solid #1e2d4a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.model} style={{ borderBottom: '1px solid #0c1022', background: row.rank <= 3 ? 'rgba(245,158,11,0.02)' : 'transparent' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: medalColor(row.rank), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: '1rem', color: row.rank <= 3 ? '#000' : '#6b7a9a' }}>{row.rank}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', color: '#e8edf5' }}>{row.model}</td>
                    <td style={{ padding: '14px 18px' }}><span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.4rem', color: row.rank === 1 ? '#f59e0b' : '#00e5ff' }}>{row.elo}</span></td>
                    <td style={{ padding: '14px 18px', color: '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>{row.wins}</td>
                    <td style={{ padding: '14px 18px', color: '#ef4444', fontFamily: "'JetBrains Mono',monospace" }}>{row.losses}</td>
                    <td style={{ padding: '14px 18px', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace" }}>{row.ties}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '70px', height: '5px', background: '#0c1022' }}>
                          <div style={{ height: '100%', width: `${row.win_rate}%`, background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>{row.win_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
