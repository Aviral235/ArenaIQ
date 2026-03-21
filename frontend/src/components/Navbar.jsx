import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/arena',       label: '⚔️ Arena' },
  { to: '/vote',        label: '🗳️ Vote' },
  { to: '/dashboard',   label: '📊 Dashboard' },
  { to: '/bias',        label: '🔬 Bias Lab' },
  { to: '/optimizer',   label: '⚡ Optimizer' },
  { to: '/leaderboard', label: '🏆 Leaderboard' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 48px',
      background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1e2d4a',
    }}>
      <Link to="/" style={{
        fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem',
        letterSpacing: '0.06em', color: '#e8edf5', textDecoration: 'none',
      }}>
        Arena<span style={{ color: '#00e5ff' }}>IQ</span>
      </Link>
      <ul style={{ display: 'flex', gap: '4px', listStyle: 'none' }}>
        {LINKS.map(l => {
          const active = pathname === l.to
          return (
            <li key={l.to}>
              <Link to={l.to} style={{
                padding: '6px 12px', display: 'block',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '0.68rem', letterSpacing: '0.06em',
                textTransform: 'uppercase', textDecoration: 'none',
                color: active ? '#00e5ff' : '#6b7a9a',
                background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                border: active ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                borderRadius: '2px', transition: 'all 0.2s',
              }}>
                {l.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
