import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import styles from './GenerateButton.module.css'

export default function GenerateButton({ onClick, loading }) {
  return (
    <motion.button
      className={styles.btn}
      onClick={onClick}
      disabled={loading}
      whileHover={!loading ? { scale: 1.02 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <span className={styles.shimmer} />
      {loading ? (
        <>
          <Loader2 size={18} className={styles.spin} />
          Generating...
        </>
      ) : (
        <>
          <Sparkles size={18} />
          Generate Image
        </>
      )}
    </motion.button>
  )
}
