import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useInView, useAnimation } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── data ─── */
const STATS = [
  { num: '55K', label: 'Training Battles', sub: 'Real human votes from Chatbot Arena', end: 55, suffix: 'K' },
  { num: '6',   label: 'Platform Modules', sub: 'Arena · Vote · Analyze · Bias · Optimize · Rank', end: 6, suffix: '' },
  { num: '3',   label: 'Prediction Classes', sub: 'Model A wins · Model B wins · Tie', end: 3, suffix: '' },
  { num: '9.5', label: 'Impact Score', sub: 'Technical depth × originality × live demo', end: 9.5, suffix: '' },
]

const FEATURES = [
  { icon: '⚔️', title: 'Live AI Battle Arena', desc: 'Two real LLMs respond to your prompt simultaneously. ML predicts the winner before you vote.', tag: 'Core Feature', color: '#6c5ce7', span: 2 },
  { icon: '🗳️', title: 'Human Voting Engine', desc: 'Collect real votes from friends and faculty — generating original research data.', tag: 'Original Data', color: '#e84393', span: 1 },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time win rates, bias charts, live prediction counters across all platform usage.', tag: 'Insights', color: '#00cec9', span: 1 },
  { icon: '🔬', title: 'Bias Detection Lab', desc: 'Measure verbosity, position, structure bias. Present findings as original AI research.', tag: 'Research', color: '#fd79a8', span: 1 },
  { icon: '⚡', title: 'Adversarial Optimizer', desc: 'Rewrite any response to maximize predicted win probability — raises ethical questions.', tag: 'Ethical AI', color: '#fdcb6e', span: 1 },
  { icon: '🏆', title: 'ELO Model Leaderboard', desc: 'Chess-style ELO ratings for every LLM — GPT-4 vs Claude vs Llama head-to-head.', tag: 'Rankings', color: '#a29bfe', span: 1 },
]

const useWindowWidth = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, [])
  return w
}

function AnimatedCounter({ end, suffix, started }) {
  const [display, setDisplay] = useState('0')
  const objRef = useRef({ val: 0 })
  useEffect(() => {
    if (!started) return
    const obj = objRef.current; obj.val = 0
    gsap.to(obj, { val: end, duration: 2, ease: 'power2.out', onUpdate: () => { const v = obj.val; setDisplay(v % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString()) } })
  }, [started, end])
  return <>{display}{suffix}</>
}

export default function Landing() {
  const width = useWindowWidth()
  const isMobile = width < 480, isTablet = width < 768

  const heroRef = useRef(null), gridBgRef = useRef(null), labelRef = useRef(null)
  const whoRef = useRef(null), winsRef = useRef(null), arenaRef = useRef(null)
  const paraRef = useRef(null), ctaRef = useRef(null), statsRef = useRef(null)
  const featuresRef = useRef(null), featLabelRef = useRef(null), featHeadRef = useRef(null)
  const featGridRef = useRef(null), cardsRef = useRef([])
  const rlhfRef = useRef(null), rewardRef = useRef(null), pageRef = useRef(null)
  const [countersStarted, setCountersStarted] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 0.4 })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(labelRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.2)
      tl.fromTo(whoRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.3)
      tl.fromTo(winsRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.45)
      tl.to(winsRef.current, { textShadow: '0 0 30px rgba(108,92,231,0.6), 0 0 60px rgba(0,206,201,0.3)', scale: 1.02, duration: 0.4, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 1.15)
      tl.fromTo(arenaRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.6)
      tl.fromTo(paraRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.8)
      if (ctaRef.current) tl.fromTo(ctaRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.5 }, 0.9)
      if (statsRef.current) tl.fromTo(statsRef.current.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, onComplete: () => setCountersStarted(true) }, 1.05)

      gsap.fromTo(featLabelRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, scrollTrigger: { trigger: featLabelRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' } })
      gsap.fromTo(featHeadRef.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: featHeadRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' } })
      gsap.fromTo(cardsRef.current.filter(Boolean), { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: featGridRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' } })
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const rlhfInView = useInView(rlhfRef, { margin: '-100px' })
  const rewardControls = useAnimation()
  useEffect(() => {
    if (rlhfInView && rewardRef.current) {
      const t = setTimeout(() => { rewardControls.start({ color: ['#e4e8f1', '#6c5ce7', '#e4e8f1'], transition: { duration: 1.2, ease: 'easeInOut' } }) }, 600)
      return () => clearTimeout(t)
    }
  }, [rlhfInView, rewardControls])

  const heroPad = isMobile ? '40px 20px' : isTablet ? '60px 32px' : '80px 64px'
  const sectPad = isMobile ? '60px 20px' : isTablet ? '72px 32px' : '100px 64px'
  const rlhfPad = isMobile ? '44px 20px' : isTablet ? '52px 32px' : '72px 64px'
  const statsCols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)'
  const featCols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'
  const ctaDir = isMobile ? 'column' : 'row'

  return (
    <div ref={pageRef} style={{ paddingTop: '80px', position: 'relative', zIndex: 1 }}>
      {/* ═══ HERO ═══ */}
      <section ref={heroRef} style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: heroPad, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          {/* Label */}
          <div ref={labelRef} className="section-label" style={{ color: '#a29bfe', opacity: 0 }}>
            Human Preference Intelligence Platform
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(4rem,9vw,8rem)', lineHeight: '0.95', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span ref={whoRef} style={{ display: 'inline-block', opacity: 0, color: '#e4e8f1' }}>WHO</span><br />
            <span ref={winsRef} className="gradient-text" style={{ display: 'inline-block', opacity: 0 }}>WINS</span><br />
            <span ref={arenaRef} style={{ display: 'inline-block', WebkitTextStroke: '2px rgba(255,255,255,0.15)', color: 'transparent', opacity: 0 }}>THE ARENA</span>
          </h1>

          {/* Paragraph */}
          <p ref={paraRef} style={{
            fontSize: '1.1rem', lineHeight: '1.85', color: 'rgba(255,255,255,0.55)',
            marginTop: '28px', maxWidth: '520px', opacity: 0, fontWeight: 300,
          }}>
            A full-stack AI research platform that{' '}
            <strong style={{ color: '#e4e8f1', fontWeight: 500 }}>predicts, explains, and measures</strong>{' '}
            human preference in LLM responses — the same technology behind ChatGPT, Claude, and Gemini.
          </p>

          {/* CTA buttons */}
          <div ref={ctaRef} style={{ display: 'flex', flexDirection: ctaDir, gap: '14px', marginTop: '36px' }}>
            <Link to="/arena" className="glass-btn glass-btn-primary" style={{ opacity: 0, width: isMobile ? '100%' : undefined }}>
              ⚔️ Enter the Arena →
            </Link>
            <Link to="/dashboard" className="glass-btn" style={{ opacity: 0, width: isMobile ? '100%' : undefined }}>
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{
          display: 'grid', gridTemplateColumns: statsCols,
          gap: '16px', marginTop: '72px', maxWidth: '920px',
        }}>
          {STATS.map(s => (
            <div key={s.label} className="glass-card" style={{ opacity: 0, padding: '24px', cursor: 'default' }}>
              <div className="gradient-text" style={{ fontFamily: "'Poppins',sans-serif", fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
                <AnimatedCounter end={s.end} suffix={s.suffix} started={countersStarted} />
              </div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: "'JetBrains Mono',monospace", marginTop: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section ref={featuresRef} style={{ padding: sectPad }}>
        <div ref={featLabelRef} className="section-label" style={{ color: '#e84393', opacity: 0 }}>
          Platform Features
        </div>
        <h2 ref={featHeadRef} style={{
          fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 800,
          lineHeight: '0.95', letterSpacing: '-0.02em', marginBottom: '48px',
          clipPath: 'inset(0 100% 0 0)',
        }}>
          <span className="gradient-text">SIX POWERFUL</span> MODULES
        </h2>

        <div ref={featGridRef} style={{ display: 'grid', gridTemplateColumns: featCols, gap: '16px' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              ref={el => (cardsRef.current[i] = el)}
              whileHover={{ y: -6, scale: 1.02, boxShadow: `0 16px 48px ${f.color}25, 0 0 20px ${f.color}15` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass-card"
              style={{
                gridColumn: (f.span > 1 && !isMobile && !isTablet) ? `span ${f.span}` : undefined,
                cursor: 'default', opacity: 0,
                borderTop: `2px solid ${f.color}40`,
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.3rem', fontWeight: 600, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
              <span className="glass-tag" style={{ marginTop: '16px', color: f.color, borderColor: `${f.color}30` }}>{f.tag}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ RLHF CONTEXT ═══ */}
      <motion.section
        ref={rlhfRef}
        initial={{ y: 40, opacity: 0 }}
        animate={rlhfInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ padding: rlhfPad }}
      >
        <div className="glass" style={{ maxWidth: '720px', padding: isMobile ? '32px 24px' : '48px 40px', borderRadius: '20px' }}>
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={rlhfInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            style={{ fontFamily: "'Poppins',sans-serif", fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px' }}
          >
            THE TECHNOLOGY BEHIND <span className="gradient-text">CHATGPT</span>
          </motion.h2>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={rlhfInView ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            style={{ fontSize: '1rem', lineHeight: '1.85', color: 'rgba(255,255,255,0.55)' }}
          >
            Reinforcement Learning from Human Feedback (RLHF) is how OpenAI, Anthropic, and Google train
            their flagship models. It relies on{' '}
            <motion.strong ref={rewardRef} animate={rewardControls} style={{ color: '#e4e8f1', fontWeight: 500 }}>
              reward models
            </motion.strong>{' '}
            that predict human preference — exactly what ArenaIQ builds from scratch.
          </motion.p>
        </div>
      </motion.section>
    </div>
  )
}
