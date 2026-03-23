import { useEffect, useState } from 'react'

export function ProbBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(value * 100), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <span style={{
        width: '70px', fontSize: '0.72rem', letterSpacing: '0.05em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        fontFamily: "'JetBrains Mono',monospace", flexShrink: 0,
      }}>{label}</span>
      <div style={{
        flex: 1, height: '10px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${w}%`, borderRadius: '6px',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 12px ${color}40`,
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <span style={{
        width: '42px', textAlign: 'right', fontSize: '0.85rem',
        fontFamily: "'JetBrains Mono',monospace", color: '#e4e8f1', fontWeight: 600,
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
      background: 'rgba(108,92,231,0.08)',
      border: '1px solid rgba(108,92,231,0.2)',
      padding: '18px 22px', marginTop: '16px', borderRadius: '12px',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#a29bfe', marginBottom: '10px', fontFamily: "'JetBrains Mono',monospace",
      }}>🧠 Why this prediction?</div>
      <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)' }}>{explanation}</p>
      {factors.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {factors.map((f, i) => (
            <span key={i} style={{
              fontSize: '0.68rem', letterSpacing: '0.05em',
              padding: '4px 12px', borderRadius: '8px',
              fontFamily: "'JetBrains Mono',monospace",
              background: f.value > 0 ? 'rgba(0,206,201,0.12)' : 'rgba(232,67,147,0.12)',
              color: f.value > 0 ? '#00cec9' : '#e84393',
              border: `1px solid ${f.value > 0 ? 'rgba(0,206,201,0.25)' : 'rgba(232,67,147,0.25)'}`,
            }}>
              {f.feature}: {f.value > 0 ? '+' : ''}{f.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
