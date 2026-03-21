import { useEffect, useState } from 'react'

export function ProbBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(value * 100), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <span style={{
        width: '70px', fontSize: '0.7rem', letterSpacing: '0.06em',
        textTransform: 'uppercase', color: '#6b7a9a',
        fontFamily: "'JetBrains Mono',monospace", flexShrink: 0,
      }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#1e2d4a', overflow: 'hidden', borderRadius: '1px' }}>
        <div style={{
          height: '100%', width: `${w}%`, background: color, borderRadius: '1px',
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <span style={{
        width: '42px', textAlign: 'right', fontSize: '0.85rem',
        fontFamily: "'JetBrains Mono',monospace", color: '#e8edf5', fontWeight: 500,
      }}>{(value * 100).toFixed(0)}%</span>
    </div>
  )
}

export function ExplainBox({ explanation, shap }) {
  if (!explanation) return null
  let factors = []
  try { factors = typeof shap === 'string' ? JSON.parse(shap) : (shap || []) } catch {}
  return (
    <div style={{
      background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)',
      padding: '18px 22px', marginTop: '16px', borderRadius: '2px',
    }}>
      <div style={{
        fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#00e5ff', marginBottom: '10px', fontFamily: "'JetBrains Mono',monospace",
      }}>🧠 Why this prediction?</div>
      <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#a0aec0' }}>{explanation}</p>
      {factors.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {factors.map((f, i) => (
            <span key={i} style={{
              fontSize: '0.68rem', letterSpacing: '0.06em',
              padding: '3px 10px', fontFamily: "'JetBrains Mono',monospace",
              background: f.value > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: f.value > 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${f.value > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {f.feature}: {f.value > 0 ? '+' : ''}{f.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
