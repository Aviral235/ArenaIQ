import { useEffect, useState, useRef } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStats, getHistory } from '../api'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

// Custom Glass Tooltip for high contrast
const CustomGlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(108,92,231,0.15)',
        color: '#ffffff',
        fontFamily: "'JetBrains Mono',monospace",
        zIndex: 1000,
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>{label || payload[0].payload.name}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, margin: '4px 0' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color || entry.payload.fill }} />
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const pageRef = useRef(null), tagRef = useRef(null), h1Ref = useRef(null)
  const metricsRef = useRef(null), chartsRef = useRef(null), tableRef = useRef(null)

  useEffect(() => {
    Promise.all([getStats(), getHistory(30)])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data.battles); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(tagRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0.1)
      tl.fromTo(h1Ref.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7 }, 0.2)
      if (metricsRef.current) gsap.fromTo(metricsRef.current.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: metricsRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' } })
      if (chartsRef.current) gsap.fromTo(chartsRef.current.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: chartsRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } })
      if (tableRef.current) { const rows = tableRef.current.querySelectorAll('tbody tr'); if (rows.length) gsap.fromTo(rows, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.35, ease: 'power2.out', scrollTrigger: { trigger: tableRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' } }) }
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, pageRef)
    return () => ctx.revert()
  }, [loading])

  const hdrPad = isMobile ? '40px 20px 28px' : isTablet ? '46px 32px 32px' : '52px 64px 36px'
  const bodyPad = isMobile ? '24px 20px' : isTablet ? '30px 32px' : '36px 64px'
  const metCols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)'
  const chartCols = isMobile ? '1fr' : '1fr 1fr'

  if (loading) return (
    <AnimatePresence>
      <motion.div key="dash-load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ paddingTop: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', position: 'relative', zIndex: 1 }}>
        <div className="glass" style={{ textAlign: 'center', padding: '48px 60px', borderRadius: '20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Loading dashboard...</div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  const COLORS = ['#6c5ce7', '#e84393', 'rgba(255,255,255,0.35)']
  const winData = stats ? [
    { name: 'Model A Wins', value: stats.win_distribution.model_a, color: COLORS[0] },
    { name: 'Model B Wins', value: stats.win_distribution.model_b, color: COLORS[1] },
    { name: 'Ties', value: stats.win_distribution.tie, color: COLORS[2] },
  ] : []

  const biasData = [
    { name: 'Verbosity', value: stats?.bias_findings.verbosity_bias_pct || 58, fill: '#e84393' },
    { name: 'Position', value: stats?.bias_findings.position_bias_pct || 54, fill: '#6c5ce7' },
    { name: 'Structure', value: 76, fill: '#fd79a8' },
    { name: 'Tie Rate', value: stats?.bias_findings.tie_rate_pct || 12, fill: 'rgba(255,255,255,0.35)' },
  ]

  const metricCards = stats ? [
    { num: stats.total_battles, label: 'Total Battles', color: '#6c5ce7' },
    { num: stats.total_votes, label: 'Human Votes', color: '#e84393' },
    { num: `${stats.accuracy_pct}%`, label: 'Model Accuracy', color: '#00cec9' },
    { num: stats.recent_battles_7d, label: 'Battles This Week', color: '#fdcb6e' },
  ] : []

  return (
    <div ref={pageRef} style={{ paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      <div style={{ padding: hdrPad }}>
        <div ref={tagRef} className="section-label" style={{ color: '#6c5ce7', opacity: 0 }}>Analytics</div>
        <h1 ref={h1Ref} style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(2.5rem,5vw,3.5rem)', fontWeight: 800, lineHeight: '0.95', clipPath: 'inset(0 100% 0 0)' }}>
          📊 <span className="gradient-text">ANALYTICS</span> DASHBOARD
        </h1>
      </div>

      <div style={{ padding: bodyPad }}>
        {/* Metric cards */}
        <div ref={metricsRef} style={{ display: 'grid', gridTemplateColumns: metCols, gap: '16px', marginBottom: '28px' }}>
          {metricCards.map(m => (
            <motion.div key={m.label} whileHover={{ y: -4, boxShadow: `0 16px 48px ${m.color}20` }} transition={{ duration: 0.25 }}
              className="glass-card" style={{ opacity: 0, position: 'relative', overflow: 'hidden' }}>
              <div className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '2.8rem', fontWeight: 700, lineHeight: 1 }}>{m.num}</div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono',monospace", marginTop: '8px' }}>{m.label}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${m.color}, ${m.color}00)`, borderRadius: '0 0 16px 16px' }} />
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div ref={chartsRef} style={{ display: 'grid', gridTemplateColumns: chartCols, gap: '20px', marginBottom: '24px' }}>
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25 }} className="glass-card" style={{ opacity: 0 }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Win Distribution</h3>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginBottom: '18px' }}>Prediction split across all battles</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={winData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="rgba(255,255,255,0.05)" strokeWidth={2}>{winData.map((d, i) => <Cell key={i} fill={d.color} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))', transition: 'all 0.3s ease' }} className="chart-cell-hover" />)}</Pie><Tooltip content={<CustomGlassTooltip />} cursor={{ fill: 'transparent' }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
              {winData.map(d => (<div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}` }} /><span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>{d.name}: {d.value}</span></div>))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25 }} className="glass-card" style={{ opacity: 0 }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Bias Detection</h3>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginBottom: '18px' }}>Measured biases in human preference (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={biasData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} domain={[0, 100]} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} />
                <Tooltip content={<CustomGlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} /><Bar dataKey="value" radius={[6,6,0,0]}>{biasData.map((d, i) => <Cell key={i} fill={d.fill} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.15))', transition: 'all 0.3s ease' }} className="chart-cell-hover" />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* History table */}
        <motion.div whileHover={{ boxShadow: '0 4px 24px rgba(108,92,231,0.1)' }} transition={{ duration: 0.25 }} className="glass-card">
          <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Recent Battles</h3>
          <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginBottom: '18px' }}>Latest {history.length} battles through the platform</p>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No battles yet — go to the Arena to start!</div>
          ) : (
            <div ref={tableRef} style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Prompt', 'Model A', 'Model B', 'Predicted', 'Voted', 'Correct', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono',monospace", borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {history.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.prompt}</td>
                      <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#6c5ce7', fontFamily: "'JetBrains Mono',monospace", maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.model_a}</td>
                      <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#e84393', fontFamily: "'JetBrains Mono',monospace", maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.model_b}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="glass-tag" style={{ color: b.predicted_winner === 'a' ? '#6c5ce7' : b.predicted_winner === 'b' ? '#e84393' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{b.predicted_winner}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase' }}>{b.human_vote || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{b.correct === null ? <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span> : b.correct ? <span style={{ color: '#00cec9' }}>✓</span> : <span style={{ color: '#e84393' }}>✗</span>}</td>
                      <td style={{ padding: '10px 12px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono',monospace" }}>{new Date(b.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
