import { Link } from 'react-router-dom'

const STATS = [
  { num: '55K',  label: 'Training Battles',  sub: 'Real human votes from Chatbot Arena' },
  { num: '6',    label: 'Platform Modules',  sub: 'Arena · Vote · Analyze · Bias · Optimize · Rank' },
  { num: '3',    label: 'Prediction Classes', sub: 'Model A wins · Model B wins · Tie' },
  { num: '9.5',  label: 'Impact Score',       sub: 'Technical depth × originality × live demo' },
]

const FEATURES = [
  { icon: '⚔️', title: 'Live AI Battle Arena',   desc: 'Two real LLMs respond to your prompt simultaneously. ML predicts the winner before you vote.', tag: 'Core Feature', color: '#00e5ff', span: 2 },
  { icon: '🗳️', title: 'Human Voting Engine',    desc: 'Collect real votes from friends and faculty — generating original research data.', tag: 'Original Data', color: '#f26d2d', span: 1 },
  { icon: '📊', title: 'Analytics Dashboard',    desc: 'Real-time win rates, bias charts, live prediction counters across all platform usage.', tag: 'Insights', color: '#10b981', span: 1 },
  { icon: '🔬', title: 'Bias Detection Lab',     desc: 'Measure verbosity, position, structure bias. Present findings as original AI research.', tag: 'Research', color: '#ef4444', span: 1 },
  { icon: '⚡', title: 'Adversarial Optimizer',  desc: 'Rewrite any response to maximize predicted win probability — raises ethical questions.', tag: 'Ethical AI', color: '#f59e0b', span: 1 },
  { icon: '🏆', title: 'ELO Model Leaderboard', desc: 'Chess-style ELO ratings for every LLM — GPT-4 vs Claude vs Llama head-to-head.', tag: 'Rankings', color: '#7c3aed', span: 1 },
]

export default function Landing() {
  return (
    <div style={{ paddingTop: '80px' }}>
      {/* HERO */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 64px',
        borderBottom: '1px solid #1e2d4a', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(0,229,255,0.06),transparent)',
          top: '-80px', right: '-60px', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#00e5ff', fontFamily: "'JetBrains Mono',monospace",
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
          }}>
            <span style={{ width: '24px', height: '1px', background: '#00e5ff', display: 'block' }} />
            Human Preference Intelligence Platform
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 'clamp(4.5rem,9vw,9rem)', lineHeight: '0.9', letterSpacing: '0.01em',
          }}>
            WHO<br />
            <span style={{ color: '#00e5ff' }}>WINS</span><br />
            <span style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)', color: 'transparent' }}>THE ARENA</span>
          </h1>
          <p style={{
            fontSize: '1.1rem', lineHeight: '1.85', color: '#6b7a9a',
            marginTop: '24px', maxWidth: '520px',
          }}>
            A full-stack AI research platform that{' '}
            <strong style={{ color: '#e8edf5' }}>predicts, explains, and measures</strong>{' '}
            human preference in LLM responses — the same technology behind ChatGPT, Claude, and Gemini.
          </p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '36px', flexWrap: 'wrap' }}>
            <Link to="/arena" style={{
              background: '#00e5ff', color: '#000', padding: '14px 32px',
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)',
              fontWeight: 500,
            }}>⚔️ Enter the Arena →</Link>
            <Link to="/dashboard" style={{
              background: 'transparent', color: '#e8edf5', padding: '14px 32px',
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              border: '1px solid #1e2d4a',
            }}>View Dashboard</Link>
          </div>
        </div>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: '1px', background: '#1e2d4a', marginTop: '72px', maxWidth: '900px',
        }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: '#0c1022', padding: '22px' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.4rem', color: '#00e5ff', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7a9a', fontFamily: "'JetBrains Mono',monospace", marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '0.78rem', color: '#4a5568', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 64px', borderBottom: '1px solid #1e2d4a' }}>
        <div style={{
          fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#f26d2d', fontFamily: "'JetBrains Mono',monospace",
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
        }}>
          <span style={{ width: '20px', height: '1px', background: '#f26d2d', display: 'block' }} />
          Platform Features
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,5vw,5rem)',
          lineHeight: '0.9', letterSpacing: '0.02em', marginBottom: '56px',
        }}>SIX POWERFUL MODULES</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#1e2d4a' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              background: i === 0 ? '#0c1022' : '#111827',
              padding: '32px 26px',
              borderTop: `3px solid ${i === 0 ? f.color : 'transparent'}`,
              gridColumn: f.span > 1 ? `span ${f.span}` : undefined,
              transition: 'all 0.3s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderTopColor = f.color; e.currentTarget.style.background = '#0d1421' }}
              onMouseLeave={e => { e.currentTarget.style.borderTopColor = i === 0 ? f.color : 'transparent'; e.currentTarget.style.background = i === 0 ? '#0c1022' : '#111827' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', letterSpacing: '0.03em', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: '#6b7a9a' }}>{f.desc}</p>
              <span style={{
                display: 'inline-block', marginTop: '14px',
                fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem',
                letterSpacing: '0.1em', padding: '4px 10px',
                color: f.color, background: `${f.color}18`, border: `1px solid ${f.color}33`,
              }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RLHF context */}
      <section style={{ padding: '72px 64px', background: '#0c1022' }}>
        <div style={{ maxWidth: '680px' }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.6rem', marginBottom: '16px' }}>
            THE TECHNOLOGY BEHIND CHATGPT
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.85', color: '#6b7a9a' }}>
            Reinforcement Learning from Human Feedback (RLHF) is how OpenAI, Anthropic, and Google train
            their flagship models. It relies on <strong style={{ color: '#e8edf5' }}>reward models</strong> that
            predict human preference — exactly what ArenaIQ builds from scratch.
          </p>
        </div>
      </section>
    </div>
  )
}
