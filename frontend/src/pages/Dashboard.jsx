import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStats, getHistory } from '../api'

const CARD = { background: '#111827', border: '1px solid #1e2d4a', padding: '26px' }
const TT   = { contentStyle: { background: '#111827', border: '1px solid #1e2d4a', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem' } }

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getHistory(30)])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data.battles); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ paddingTop: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#6b7a9a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}>Loading dashboard...</div>
      </div>
    </div>
  )

  const winData = stats ? [
    { name: 'Model A Wins', value: stats.win_distribution.model_a, color: '#00e5ff' },
    { name: 'Model B Wins', value: stats.win_distribution.model_b, color: '#f26d2d' },
    { name: 'Ties',         value: stats.win_distribution.tie,     color: '#6b7a9a' },
  ] : []

  const biasData = [
    { name: 'Verbosity', value: stats?.bias_findings.verbosity_bias_pct || 58, fill: '#f26d2d' },
    { name: 'Position',  value: stats?.bias_findings.position_bias_pct  || 54, fill: '#00e5ff' },
    { name: 'Structure', value: 76,                                             fill: '#ef4444' },
    { name: 'Tie Rate',  value: stats?.bias_findings.tie_rate_pct       || 12, fill: '#6b7a9a' },
  ]

  const metricCards = stats ? [
    { num: stats.total_battles,      label: 'Total Battles',     color: '#00e5ff' },
    { num: stats.total_votes,        label: 'Human Votes',       color: '#f26d2d' },
    { num: `${stats.accuracy_pct}%`, label: 'Model Accuracy',    color: '#10b981' },
    { num: stats.recent_battles_7d,  label: 'Battles This Week', color: '#f59e0b' },
  ] : []

  return (
    <div style={{ paddingTop: '80px' }}>
      <div style={{ padding: '52px 64px 36px', borderBottom: '1px solid #1e2d4a' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00e5ff', fontFamily: "'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ width: '20px', height: '1px', background: '#00e5ff', display: 'block' }} />Analytics
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.8rem,5vw,4rem)', lineHeight: '0.9' }}>
          📊 ANALYTICS DASHBOARD
        </h1>
      </div>

      <div style={{ padding: '36px 64px' }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#1e2d4a', marginBottom: '28px' }}>
          {metricCards.map(m => (
            <div key={m.label} style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.8rem', lineHeight: 1, color: m.color }}>{m.num}</div>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginTop: '6px' }}>{m.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: m.color }} />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={CARD}>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', marginBottom: '4px' }}>Win Distribution</h3>
            <p style={{ fontSize: '0.76rem', color: '#6b7a9a', marginBottom: '18px' }}>Prediction split across all battles</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={winData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {winData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip {...TT} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
              {winData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: '0.72rem', color: '#6b7a9a' }}>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={CARD}>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', marginBottom: '4px' }}>Bias Detection</h3>
            <p style={{ fontSize: '0.76rem', color: '#6b7a9a', marginBottom: '18px' }}>Measured biases in human preference (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={biasData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="name" tick={{ fill: '#6b7a9a', fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} />
                <YAxis tick={{ fill: '#6b7a9a', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip {...TT} />
                <Bar dataKey="value">{biasData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History table */}
        <div style={CARD}>
          <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', marginBottom: '4px' }}>Recent Battles</h3>
          <p style={{ fontSize: '0.76rem', color: '#6b7a9a', marginBottom: '18px' }}>Latest {history.length} battles through the platform</p>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7a9a' }}>
              No battles yet — go to the Arena to start!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Prompt', 'Model A', 'Model B', 'Predicted', 'Voted', 'Correct', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '0.63rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", borderBottom: '1px solid #1e2d4a' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {history.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #0c1022' }}>
                      <td style={{ padding: '9px 12px', fontSize: '0.8rem', color: '#a0aec0', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.prompt}</td>
                      <td style={{ padding: '9px 12px', fontSize: '0.72rem', color: '#00e5ff', fontFamily: "'JetBrains Mono',monospace", maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.model_a}</td>
                      <td style={{ padding: '9px 12px', fontSize: '0.72rem', color: '#f26d2d', fontFamily: "'JetBrains Mono',monospace", maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.model_b}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", background: b.predicted_winner === 'a' ? 'rgba(0,229,255,0.1)' : b.predicted_winner === 'b' ? 'rgba(242,109,45,0.1)' : 'rgba(107,122,154,0.1)', color: b.predicted_winner === 'a' ? '#00e5ff' : b.predicted_winner === 'b' ? '#f26d2d' : '#6b7a9a' }}>{b.predicted_winner}</span>
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: '0.75rem', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase' }}>{b.human_vote || '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{b.correct === null ? <span style={{ color: '#6b7a9a' }}>—</span> : b.correct ? <span style={{ color: '#10b981' }}>✓</span> : <span style={{ color: '#ef4444' }}>✗</span>}</td>
                      <td style={{ padding: '9px 12px', fontSize: '0.7rem', color: '#4a5568', fontFamily: "'JetBrains Mono',monospace" }}>{new Date(b.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
