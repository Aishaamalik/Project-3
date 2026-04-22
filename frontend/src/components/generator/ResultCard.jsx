import { useState } from 'react'
import { Download, RefreshCw, Copy, Check, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import StarRating from '../StarRating'
import styles from './ResultCard.module.css'

const actionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}
const btnVariant = {
  hidden:  { opacity: 0, y: 10, scale: 0.9 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

export default function ResultCard({ image, onRegenerate }) {
  const { toggleFavorite, setRating } = useApp()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(image.prompt)
    setCopied(true)
    toast.success('Prompt copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(image.url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `dreamcanvas-${image.id}.jpg`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch { toast.error('Download failed') }
  }

  return (
    <div className={`${styles.card} glass`}>
      <div className={styles.imageWrap}>
        <img src={image.url} alt={image.prompt} className={styles.image} />
        <div className={styles.topOverlay}>
          <span className={styles.styleBadge}>{image.style}</span>
          <span className={styles.sizeBadge}>{image.size}</span>
        </div>
        {/* Favorite button on image */}
        <motion.button
          className={`${styles.favBtn} ${image.favorite ? styles.favActive : ''}`}
          onClick={() => toggleFavorite(image.id)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={image.favorite ? 'fav' : 'unfav'}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Heart size={16} fill={image.favorite ? '#A27B5C' : 'none'} />
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      <div className={styles.footer}>
        <div className={styles.promptRow}>
          <p className={styles.prompt}>{image.prompt}</p>
          <StarRating value={image.rating || 0} onChange={r => setRating(image.id, r)} />
        </div>
        <div className={styles.actions}>
          <motion.div variants={actionVariants} initial="hidden" animate="visible"
            style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <motion.button variants={btnVariant} className={styles.actionBtn}
              onClick={handleDownload} whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.95 }}>
              <Download size={15}/> Download
            </motion.button>
            <motion.button variants={btnVariant} className={styles.actionBtn}
              onClick={onRegenerate} whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.95 }}>
              <RefreshCw size={15}/> Regenerate
            </motion.button>
            <motion.button variants={btnVariant}
              className={`${styles.actionBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy} whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.95 }}>
              {copied ? <Check size={15}/> : <Copy size={15}/>}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
