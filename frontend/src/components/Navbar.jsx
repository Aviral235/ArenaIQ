import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
  
  // Desktop Hover State (kept from original)
  const [hovered, setHovered] = useState(null)
  
  // Mobile & Scroll States
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Shrink navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      {/* Floating Blur Background behind Navbar */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 blur-3xl -z-10 pointer-events-none" aria-hidden="true" />

      {/* Spacer to prevent fixed navbar from overlapping content, reduced height */}
      <div className="h-[40px] w-full" aria-hidden="true" />

      <nav 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 ${
          scrolled 
            ? 'py-4 px-6 md:px-12 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
            : 'py-[18px] px-6 md:px-12 bg-[rgba(255,255,255,0.04)] backdrop-blur-[24px] border-b border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        }`}
      >
        <Link to="/" style={{
          marginLeft: '20px',
          fontFamily: "'Poppins',sans-serif", fontSize: '1.8rem', fontWeight: 700,
          textDecoration: 'none', letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ArenaIQ
        </Link>
        
        {/* DESKTOP VIEW: untouched navigation loop logic, just increased scaling properties */}
        <ul className="hidden lg:flex" style={{ gap: '8px', listStyle: 'none', flexWrap: 'wrap' }}>
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
                    padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: '0.9rem', fontWeight: 500,
                    letterSpacing: '0.03em', textDecoration: 'none',
                    color: active ? '#fff' : (isHov ? '#d1d5e0' : 'rgba(255,255,255,0.55)'),
                    background: active
                      ? 'linear-gradient(135deg, rgba(108,92,231,0.25), rgba(0,206,201,0.15))'
                      : (isHov ? 'rgba(255,255,255,0.06)' : 'transparent'),
                    border: active
                      ? '1px solid rgba(108,92,231,0.3)'
                      : '1px solid transparent',
                    borderRadius: '12px',
                    backdropFilter: active ? 'blur(8px)' : undefined,
                    WebkitBackdropFilter: active ? 'blur(8px)' : undefined,
                    transition: 'all 0.25s ease',
                    boxShadow: active ? '0 0 16px rgba(108,92,231,0.15)' : undefined,
                  }}>
                  {l.icon && <span style={{ fontSize: '1rem' }}>{l.icon}</span>}
                  {l.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-lg relative z-[60] transition-transform active:scale-95"
          aria-expanded={isOpen}
          aria-label="Toggle Navigation Menu"
        >
          <div className="relative w-5 h-[14px] flex flex-col justify-between">
            <span className={`block w-full h-[2px] bg-current transform transition-all duration-300 origin-left ${isOpen ? 'rotate-45 translate-y-[-1px] translate-x-[2px]' : ''}`} />
            <span className={`block w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
            <span className={`block w-full h-[2px] bg-current transform transition-all duration-300 origin-left ${isOpen ? '-rotate-45 translate-y-[1px] translate-x-[2px]' : ''}`} />
          </div>
        </button>

      </nav>

      {/* MOBILE OVERLAY BACKGROUND */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-500 z-40 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* MOBILE SIDEBAR MENU (Tailwind Only) */}
      <div 
        className={`lg:hidden fixed inset-y-0 right-0 w-[280px] bg-[#0a0f1c]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col pt-24 px-5 pb-6 gap-2 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {LINKS.map((link, idx) => {
          const isActive = pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-500 ease-out transform origin-right
                ${isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[40px] opacity-0 scale-95'} 
                ${isActive 
                  ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }
              `}
              style={{ 
                transitionDelay: isOpen ? `${100 + idx * 40}ms` : '0ms'
              }}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
            >
              {link.icon && <span className="text-xl opacity-90 transition-transform group-hover:scale-110 duration-300">{link.icon}</span>}
              <span className="tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  )
}
