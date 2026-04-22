import { motion } from 'framer-motion'
import styles from './MoonPhase.module.css'

const PHASES = [
  { name: 'New Moon',        emoji: '🌑', illumination: 0 },
  { name: 'Waxing Crescent', emoji: '🌒', illumination: 25 },
  { name: 'First Quarter',   emoji: '🌓', illumination: 50 },
  { name: 'Waxing Gibbous',  emoji: '🌔', illumination: 75 },
  { name: 'Full Moon',       emoji: '🌕', illumination: 100 },
  { name: 'Waning Gibbous',  emoji: '🌖', illumination: 75 },
  { name: 'Last Quarter',    emoji: '🌗', illumination: 50 },
  { name: 'Waning Crescent', emoji: '🌘', illumination: 25 },
]

function getCurrentPhase() {
  // Approximate moon phase from date
  const now = new Date()
  const known = new Date('2000-01-06') // known new moon
  const diff = (now - known) / (1000 * 60 * 60 * 24)
  const cycle = 29.53058867
  const phase = ((diff % cycle) + cycle) % cycle
  const idx = Math.floor((phase / cycle) * 8) % 8
  return PHASES[idx]
}

export default function MoonPhase() {
  const phase = getCurrentPhase()

  return (
    <motion.div
      className={styles.widget}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      title={`Tonight: ${phase.name}`}
    >
      <motion.span
        className={styles.emoji}
        animate={{ filter: ['drop-shadow(0 0 4px rgba(162,123,92,0.28))', 'drop-shadow(0 0 10px rgba(220,215,201,0.5))', 'drop-shadow(0 0 4px rgba(162,123,92,0.28))'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {phase.emoji}
      </motion.span>
      <div className={styles.info}>
        <span className={styles.label}>Tonight</span>
        <span className={styles.name}>{phase.name}</span>
      </div>
    </motion.div>
  )
}
