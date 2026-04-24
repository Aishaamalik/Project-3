
import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowRight, Bot, Gauge, ImagePlus, Layers3, MoveRight,
  Sparkles, WandSparkles, Zap, X, ChevronRight, Star,
  Shield, Cpu, Palette, Users, TrendingUp, Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import MoonLogo from '../components/MoonLogo'
import styles from './LandingPage.module.css'
import imgArchitecture from '../assets/gallery-architecture.jpg'
import imgAnime        from '../assets/gallery-anime.jpg'
import imgArt          from '../assets/gallery-art.jpg'
import imgLandscape    from '../assets/gallery-landscape.jpg'
import imgPortrait     from '../assets/gallery-portrait.jpg'
import imgPortraitV2   from '../assets/gallery-portrait-v2.jpg'

/* ── static data ─────────────────────────────────────────── */
const FEATURE_CARDS = [
  { icon: ImagePlus,    title: 'AI Image Generation',  desc: 'Transform a sentence into polished, high-resolution visuals with striking detail.' },
  { icon: WandSparkles, title: 'Prompt Enhancement',   desc: 'Your ideas are auto-refined into richer prompts for sharper style, lighting, and depth.' },
  { icon: Layers3,      title: 'Multiple Styles',      desc: 'Jump between anime, photoreal, concept art, editorial, and surreal outputs instantly.' },
  { icon: Gauge,        title: 'Fast & Scalable',      desc: 'Built for speed with consistent quality whether you create one concept or a full campaign.' },
]

const STEPS = [
  { n: '01', title: 'Enter Prompt',       desc: 'Describe the subject, style, lighting, or mood in natural language.' },
  { n: '02', title: 'AI Enhances Prompt', desc: 'The system expands your input into a production-ready creative direction.' },
  { n: '03', title: 'Get Generated Image',desc: 'Receive vivid visuals optimised for inspiration, design, and rapid iteration.' },
]

const GALLERY = [
  { img: imgArchitecture, tag: 'Architectural', title: 'Neon Structure'  },
  { img: imgAnime,        tag: 'Anime',         title: 'Future Avenue'   },
  { img: imgArt,          tag: 'Art',           title: 'Synthetic Bloom' },
  { img: imgLandscape,    tag: 'Realistic',     title: 'Dream Terrain'   },
]

const STATS = [
  { value: 12, suffix: 'M+', label: 'images imagined'  },
  { value: 4.9, suffix: '/5', label: 'creator rating'  },
  { value: 120, suffix: '+',  label: 'style presets'   },
]

const WHY_US = [
  'Intuitive prompt flow for beginners and pros',
  'Polished glassmorphism surfaces with motion-first feedback',
  'Scalable image workflows for campaigns, concepts, and product visuals',
  'Premium visual direction tuned for startup-grade presentation',
]

const PERF_BARS = [
  { label: 'Prompt parsing',   pct: 88 },
  { label: 'Style adaptation', pct: 94 },
  { label: 'Visual fidelity',  pct: 99 },
]

const TRUST_BADGES = ['Faster ideation', 'Sharper prompts', 'Rich style control', 'Minimal UI friction']

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Creative Director', text: 'DreamCanvas completely changed how our team ideates. The prompt enhancement alone saves hours every week.', stars: 5 },
  { name: 'Marcus T.', role: 'Indie Game Dev',     text: 'I generate concept art in seconds. The cinematic style output is unreal — literally looks like a movie still.', stars: 5 },
  { name: 'Priya M.',  role: 'Brand Strategist',   text: 'The collections feature keeps everything organised. Best AI image tool I have used by a wide margin.', stars: 5 },
]

const PRICING = [
  { plan: 'Starter Pack',  price: '$5',  period: '', features: ['200 tokens', 'One-time purchase', 'Great for quick tests'],                     cta: 'Choose Package', highlight: false },
  { plan: 'Pro Pack',      price: '$10', period: '', features: ['500 tokens', 'One-time purchase', 'Best value for regular creators'],          cta: 'Choose Package', highlight: true  },
  { plan: 'Ultimate Pack', price: '$20', period: '', features: ['1200 tokens', 'One-time purchase', 'Highest token bundle for heavy generation'], cta: 'Choose Package', highlight: false },
]

const SKELETON_BARS = ['100%', '80%', '60%']

const fadeUp = {
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, amount: 0.15 },
  transition:  { duration: 0.65 },
}

/* ── Animated count badge ────────────────────────────────── */
function CountBadge({ value, suffix, label }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const isDecimal = value % 1 !== 0
        const duration = 1200
        const start = performance.now()
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = value * eased
          setDisplay(isDecimal ? Number(current.toFixed(1)) : Math.round(current))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <motion.div ref={ref} {...fadeUp} className={styles.statCard}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
      }}>
      <div className={styles.statValue}><span>{display}</span>{suffix}</div>
      <p className={styles.statLabel}>{label}</p>
    </motion.div>
  )
}

/* ── Auth Modal ──────────────────────────────────────────── */
function AuthModal({ defaultMode, onClose }) {
  const { login, signup } = useAuth()
  const [mode, setMode]       = useState(defaultMode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')

  const switchMode = m => { setMode(m); setError(''); setPassword(''); setConfirm('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match.'); return }
    try {
      if (mode === 'signup') {
        await signup({ email: email.trim(), password })
        toast.success('Verification email sent. Please verify first, then log in.')
      } else {
        await login({ email: email.trim(), password })
        toast.success('Logged in successfully!')
      }
      onClose()
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Authentication failed. Please try again.'
      setError(message)
    }
  }

  return (
    <motion.div className={styles.modalOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className={`${styles.modalCard} ${styles.glassPanel}`}
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.93, y: 24 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}>

        <button className={styles.modalClose} onClick={onClose}><X size={18}/></button>

        <div className={styles.tabs}>
          {['login','signup'].map(m => (
            <button key={m} className={`${styles.tab} ${mode === m ? styles.tabActive : ''}`}
              onClick={() => switchMode(m)}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
          <motion.div className={styles.tabIndicator}
            animate={{ x: mode === 'login' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}/>
        </div>

        <AnimatePresence mode="wait">
          <motion.form key={mode} className={styles.form} onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            <div>
              <h2 className={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p className={styles.formSub}>{mode === 'login' ? 'Log in to start creating' : 'Join and generate today'}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="john.doe@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="username"/>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="********"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/>
            </div>

            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div className={styles.field}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}>
                  <label className={styles.label}>Confirm Password</label>
                  <input className={styles.input} type="password" placeholder="********"
                    value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password"/>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <motion.p className={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}

            <motion.button type="submit" className={styles.submitBtn}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              {mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={15}/>
            </motion.button>

            <p className={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className={styles.switchLink}
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ── Main Landing Page ───────────────────────────────────── */
export default function LandingPage() {
  const [authMode, setAuthMode] = useState(null)
  const [cursor, setCursor]     = useState({ x: 0, y: 0, visible: false })

  const floatingNodes = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i, size: 6 + ((i * 7) % 18),
      left: `${8 + ((i * 9) % 84)}%`,
      top:  `${6 + ((i * 11) % 88)}%`,
      delay: i * 0.6, duration: 7 + (i % 4),
    })), [])

  return (
    <div className={styles.page}
      onMouseMove={e => setCursor({ x: e.clientX, y: e.clientY, visible: true })}
      onMouseLeave={() => setCursor(c => ({ ...c, visible: false }))}>

      {/* cursor glow */}
      <div className={styles.cursorGlowWrap}>
        <motion.div className={styles.cursorGlow}
          animate={{ x: cursor.x - 80, y: cursor.y - 80, opacity: cursor.visible ? 1 : 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 180, mass: 0.35 }}/>
      </div>

      {/* background layer */}
      <div className={styles.bgLayer}>
        <div className={styles.heroGrid}/>
        <div className={styles.heroRadial}/>
        {floatingNodes.map(n => (
          <motion.span key={n.id} className={styles.floatNode}
            style={{ left: n.left, top: n.top, width: n.size, height: n.size }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: n.duration, repeat: Infinity, ease: 'easeInOut', delay: n.delay }}/>
        ))}
        <motion.div className={styles.bgBlob1}
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}/>
        <motion.div className={styles.bgBlob2}
          animate={{ y: [0, -24, 0], x: [0, -28, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}/>
      </div>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#" className={styles.logoRow}>
            <span className={styles.logoIcon}><Sparkles size={18}/></span>
            <div>
              <p className={styles.logoName}>Dream<span className={styles.logoGrad}>Canvas</span></p>
              <p className={styles.logoSub}>Text-to-Image Studio</p>
            </div>
          </a>
          <nav className={styles.headerNav}>
            <a href="#features"   className={styles.navLink}>Features</a>
            <a href="#workflow"   className={styles.navLink}>How it works</a>
            <a href="#gallery"    className={styles.navLink}>Gallery</a>
            <a href="#pricing"    className={styles.navLink}>Pricing</a>
            <a href="#cta"        className={styles.navLink}>Start</a>
          </nav>
          <div className={styles.headerActions}>
            <button className={styles.btnGlass} onClick={() => setAuthMode('login')}>Log In</button>
            <button className={styles.btnHero}  onClick={() => setAuthMode('signup')}>
              Get Started <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid2col}>

            {/* left */}
            <motion.div {...fadeUp} className={styles.heroLeft}>
              <div className={styles.glassChip}>
                <Bot size={14} className={styles.chipIcon}/> Premium AI image creation for modern teams
              </div>
              <h1 className={styles.heroTitle}>
                Turn Your Words Into{' '}
                <span className={styles.gradientText}>Stunning AI Images</span>
              </h1>
              <p className={styles.heroDesc}>
                Generate cinematic concepts, product scenes, artwork, and photoreal visuals
                from a simple prompt with a fast, elegant creative workflow.
              </p>
              <div className={styles.heroCtas}>
                <button className={styles.btnHeroPrimary} onClick={() => setAuthMode('signup')}>
                  Generate Image <ArrowRight size={16}/>
                </button>
                <button className={styles.btnHeroGlass} onClick={() => setAuthMode('login')}>
                  Explore Gallery <MoveRight size={16}/>
                </button>
              </div>
              <div className={styles.statsRow}>
                {STATS.map(s => <CountBadge key={s.label} {...s}/>)}
              </div>
            </motion.div>

            {/* right — prompt lab card */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }} className={styles.heroRight}>
              <div className={styles.heroOrbitRing}/>
              <div className={`${styles.promptCard} ${styles.glassPanel} ${styles.maskFade}`}>
                <div className={styles.promptCardInner}>
                  {/* spinning ring */}
                  <motion.div className={styles.spinRing}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
                    <span className={styles.spinDot}/>
                  </motion.div>

                  <div className={styles.promptCardContent}>
                    <div className={styles.promptCardHeader}>
                      <div>
                        <p className={styles.promptCardEye}>Prompt Lab</p>
                        <p className={styles.promptCardTitle}>Generate from imagination</p>
                      </div>
                      <span className={styles.liveChip}>Live Preview</span>
                    </div>

                    <div className={`${styles.promptBox} ${styles.glassPanel}`}>
                      <p className={styles.promptBoxLabel}>Prompt</p>
                      <div className={styles.promptBoxText}>
                        A futuristic floating glass tower at dusk, luminous cyan and magenta reflections,
                        cinematic atmosphere, ultra-detailed, premium editorial lighting.
                      </div>
                      <div className={styles.promptTags}>
                        {['cinematic','photoreal','8k detail','soft glow'].map(t => (
                          <span key={t} className={styles.glassChip}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.promptCardBottom}>
                      <div className={`${styles.enhanceBox} ${styles.glassPanel}`}>
                        <div className={styles.enhanceHeader}>
                          <span className={styles.enhanceMuted}>Enhancement Engine</span>
                          <span className={styles.enhancePrimary}>+ Prompt Boost</span>
                        </div>
                        <div className={styles.skeletonBars}>
                          {SKELETON_BARS.map((w, i) => (
                            <motion.div key={i} className={styles.skeletonBar}
                              style={{ width: w }}
                              animate={{ opacity: [0.35, 0.9, 0.35] }}
                              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}/>
                          ))}
                        </div>
                      </div>

                      <motion.div className={`${styles.previewImgBox} ${styles.glassPanel}`}
                        whileHover={{ scale: 1.015 }}>
                        <img
                          src={imgArchitecture}
                          alt="AI-generated architecture preview"
                          className={styles.previewImg}/>
                        <div className={styles.previewBadge}>
                          <div>
                            <p className={styles.previewBadgeTitle}>Rendering complete</p>
                            <p className={styles.previewBadgeSub}>Refined composition · Premium mode</p>
                          </div>
                          <div className={styles.previewZapBtn}><Zap size={14}/></div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className={styles.section}>
          <div className={styles.container}>
            <motion.div {...fadeUp} className={styles.sectionHead}>
              <div className={styles.glassChip}>Core features</div>
              <h2 className={styles.sectionTitle}>Premium tools designed for AI-first creators</h2>
              <p className={styles.sectionSub}>Every interaction is tuned to feel instant, intelligent, and visually refined.</p>
            </motion.div>
            <div className={styles.featureGrid}>
              {FEATURE_CARDS.map(({ icon: Icon, title, desc }, i) => (
                <motion.article key={title} {...fadeUp}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className={`${styles.featureCard} ${styles.glassPanel} ${styles.spotlightCard}`}
                  onMouseMove={e => {
                    const r = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
                    e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
                  }}>
                  <div className={styles.featureIcon}><Icon size={20}/></div>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureDesc}>{desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="workflow" className={styles.section}>
          <div className={`${styles.container} ${styles.howGrid}`}>
            <motion.div {...fadeUp}>
              <div className={styles.glassChip}>How it works</div>
              <h2 className={styles.sectionTitle}>From prompt to polished visual in three smooth steps</h2>
              <p className={styles.sectionSub}>A clear workflow with subtle motion, smart refinement, and stunning output previews.</p>
            </motion.div>
            <div className={styles.stepsList}>
              {STEPS.map((s, i) => (
                <motion.div key={s.n} {...fadeUp}
                  transition={{ duration: 0.65, delay: i * 0.08 }}
                  className={`${styles.stepCard} ${styles.glassPanel}`}>
                  <div className={styles.stepNum}>{s.n}</div>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                  <motion.div className={styles.stepOrb}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 24 - i * 2, repeat: Infinity, ease: 'linear' }}>
                    <span className={styles.stepOrbDot}/>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section id="gallery" className={styles.section}>
          <div className={styles.container}>
            <motion.div {...fadeUp} className={styles.galleryHead}>
              <div>
                <div className={styles.glassChip}>Gallery preview</div>
                <h2 className={styles.sectionTitle}>A curated grid of vivid AI-generated inspiration</h2>
              </div>
              <p className={styles.gallerySub}>Hover to inspect styles, moods, and compositions designed to feel high-end and production ready.</p>
            </motion.div>
            <div className={styles.galleryGrid}>
              {GALLERY.map((item, i) => (
                <motion.article key={item.title} {...fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className={`${styles.galleryCard} ${styles.glassPanel}`}>
                  <div className={styles.galleryImgWrap}>
                    <img src={item.img}
                      alt={item.title} className={styles.galleryImg} loading="lazy"/>
                  </div>
                  <div className={styles.galleryOverlay}/>
                  <div className={styles.galleryInfo}>
                    <div>
                      <p className={styles.galleryTag}>{item.tag}</p>
                      <h3 className={styles.galleryTitle}>{item.title}</h3>
                    </div>
                    <span className={styles.galleryPreviewBtn}>Open preview</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us + Performance ── */}
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.whyGrid}`}>
            <motion.div {...fadeUp} className={`${styles.whyCard} ${styles.glassPanel}`}>
              <div className={styles.glassChip}>Why choose us</div>
              <h2 className={styles.sectionTitle}>Built for speed, simplicity, and unmistakable AI power</h2>
              <div className={styles.whyList}>
                {WHY_US.map(line => (
                  <div key={line} className={styles.whyItem}>
                    <Check size={14} className={styles.whyCheck}/> {line}
                  </div>
                ))}
              </div>
            </motion.div>

            <div className={styles.perfCol}>
              <motion.div {...fadeUp} className={`${styles.perfCard} ${styles.glassPanel}`}>
                <div className={styles.perfHeader}>
                  <div>
                    <p className={styles.perfEye}>Performance layer</p>
                    <h3 className={styles.perfTitle}>Realtime feel with premium polish</h3>
                  </div>
                  <span className={styles.glassChip}>Optimized UI</span>
                </div>
                <div className={styles.perfBars}>
                  {PERF_BARS.map(({ label, pct }, i) => (
                    <div key={label}>
                      <div className={styles.perfBarRow}>
                        <span className={styles.perfBarLabel}>{label}</span>
                        <span className={styles.perfBarPct}>{pct}%</span>
                      </div>
                      <div className={styles.perfBarTrack}>
                        <motion.div className={styles.perfBarFill}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 * i }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div {...fadeUp} className={`${styles.trustCard} ${styles.glassPanel}`}>
                <p className={styles.perfEye}>Trusted creative stack</p>
                <div className={styles.trustBadges}>
                  {TRUST_BADGES.map(b => (
                    <motion.span key={b} whileHover={{ y: -3 }} className={styles.trustBadge}>{b}</motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div {...fadeUp} className={styles.sectionHead}>
              <div className={styles.glassChip}>Testimonials</div>
              <h2 className={styles.sectionTitle}>Loved by creators worldwide</h2>
              <p className={styles.sectionSub}>See what designers, developers, and artists are saying about DreamCanvas.</p>
            </motion.div>
            <div className={styles.testimonialGrid}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} {...fadeUp}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className={`${styles.testimonialCard} ${styles.glassPanel}`}>
                  <div className={styles.testimonialStars}>
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={13} className={styles.starIcon}/>
                    ))}
                  </div>
                  <p className={styles.testimonialText}>"{t.text}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                    <div>
                      <p className={styles.testimonialName}>{t.name}</p>
                      <p className={styles.testimonialRole}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className={styles.section}>
          <div className={styles.container}>
            <motion.div {...fadeUp} className={styles.sectionHead}>
              <div className={styles.glassChip}>Pricing</div>
              <h2 className={styles.sectionTitle}>Token packages that match checkout</h2>
              <p className={styles.sectionSub}>Each generated image costs 10 tokens. Buy only what you need.</p>
            </motion.div>
            <div className={styles.pricingGrid}>
              {PRICING.map((p, i) => (
                <motion.div key={p.plan} {...fadeUp}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className={`${styles.pricingCard} ${styles.glassPanel} ${p.highlight ? styles.pricingHighlight : ''}`}>
                  {p.highlight && <div className={styles.pricingBadge}>Most Popular</div>}
                  <p className={styles.pricingPlan}>{p.plan}</p>
                  <div className={styles.pricingPriceRow}>
                    <span className={styles.pricingPrice}>{p.price}</span>
                    <span className={styles.pricingPeriod}>{p.period}</span>
                  </div>
                  <ul className={styles.pricingFeatures}>
                    {p.features.map(f => (
                      <li key={f} className={styles.pricingFeature}>
                        <Check size={13} className={styles.pricingCheck}/> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={p.highlight ? styles.btnHeroPrimary : styles.btnGlass}
                    onClick={() => setAuthMode('signup')}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {p.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className={styles.section}>
          <div className={styles.container}>
            <motion.div {...fadeUp} className={styles.ctaCard}>
              <div className={styles.ctaGlow}/>
              <div className={styles.ctaInner}>
                <div>
                  <p className={styles.ctaEye}>Start creating</p>
                  <h2 className={styles.ctaTitle}>Start Creating Now</h2>
                  <p className={styles.ctaDesc}>
                    Shape bold concepts, campaigns, and product visuals with a UI designed
                    to make AI creativity feel premium from the first click.
                  </p>
                  <div className={styles.ctaBtns}>
                    <button className={styles.btnHeroPrimary} onClick={() => setAuthMode('signup')}>
                      Generate Image <ArrowRight size={16}/>
                    </button>
                    <button className={styles.btnHeroGlass} onClick={() => setAuthMode('login')}>
                      Explore Gallery
                    </button>
                  </div>
                </div>

                <div className={styles.ctaQueueWrap}>
                  <div className={styles.ctaQueueInner}>
                    <p className={styles.ctaQueueLabel}>Creative queue</p>
                    <div className={styles.ctaQueue}>
                      {['Editorial portrait · glowing rim light','Anime skyline · rain reflections','Luxury product shot · studio bloom'].map((line, i) => (
                        <motion.div key={line} className={styles.ctaQueueItem}
                          animate={{ x: [0, 8, 0] }}
                          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}>
                          {line}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.ctaQueueBtns}>
                    <button className={styles.btnGlass} onClick={() => setAuthMode('signup')} style={{ flex: 1 }}>Generate Image</button>
                    <button className={styles.btnGlass} onClick={() => setAuthMode('login')}  style={{ flex: 1 }}>Explore Gallery</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <p className={styles.footerBrand}>DreamCanvas</p>
            <p className={styles.footerSub}>Futuristic text-to-image experiences, crafted for premium product storytelling.</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#features"  className={styles.footerLink}>Features</a>
            <a href="#gallery"   className={styles.footerLink}>Gallery</a>
            <a href="#pricing"   className={styles.footerLink}>Pricing</a>
            <a href="#cta"       className={styles.footerLink}>Get started</a>
            <button className={styles.footerLink} onClick={() => setAuthMode('login')}>Log In</button>
            <button className={styles.footerLink} onClick={() => setAuthMode('signup')}>Sign Up</button>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      <AnimatePresence>
        {authMode && <AuthModal defaultMode={authMode} onClose={() => setAuthMode(null)}/>}
      </AnimatePresence>
    </div>
  )
}
