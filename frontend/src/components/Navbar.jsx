import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const LINKS = [
  { to: '/',            label: 'Home',        icon: '' },
  { to: '/arena',       label: 'Arena',       icon: '⚔️' },
  { to: '/vote',        label: 'Vote',        icon: '🗳️' },
  { to: '/dashboard',   label: 'Dashboard',   icon: '📊' },
  { to: '/bias',        label: 'Bias Lab',    icon: '🔬' },
  { to: '/optimizer',   label: 'Optimizer',   icon: '⚡' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [hovered, setHovered] = useState(null)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 48px',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    }}>
      <Link to="/" style={{
        fontFamily: "'Poppins',sans-serif", fontSize: '1.5rem', fontWeight: 700,
        textDecoration: 'none', letterSpacing: '0.02em',
        background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        ArenaIQ
      </Link>
      <ul style={{ display: 'flex', gap: '4px', listStyle: 'none', flexWrap: 'wrap' }}>
        {LINKS.map(l => {
          const active = pathname === l.to
          const isHov = hovered === l.to
          return (
            <li key={l.to}>
              <Link to={l.to}
                onMouseEnter={() => setHovered(l.to)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative',
                  padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '0.75rem', fontWeight: 500,
                  letterSpacing: '0.03em', textDecoration: 'none',
                  color: active ? '#fff' : (isHov ? '#d1d5e0' : 'rgba(255,255,255,0.55)'),
                  background: active
                    ? 'linear-gradient(135deg, rgba(108,92,231,0.25), rgba(0,206,201,0.15))'
                    : (isHov ? 'rgba(255,255,255,0.06)' : 'transparent'),
                  border: active
                    ? '1px solid rgba(108,92,231,0.3)'
                    : '1px solid transparent',
                  borderRadius: '10px',
                  backdropFilter: active ? 'blur(8px)' : undefined,
                  WebkitBackdropFilter: active ? 'blur(8px)' : undefined,
                  transition: 'all 0.25s ease',
                  boxShadow: active ? '0 0 16px rgba(108,92,231,0.15)' : undefined,
                }}>
                {l.icon && <span style={{ fontSize: '0.85rem' }}>{l.icon}</span>}
                {l.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
