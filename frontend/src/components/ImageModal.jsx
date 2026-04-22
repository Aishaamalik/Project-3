import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, RotateCcw, Copy, Check, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import StarRating from './StarRating'
import styles from './ImageModal.module.css'

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ImageModal({ image, onClose }) {
  const [copied, setCopied] = useState(false)
  const { toggleFavorite, setRating } = useApp()
  const navigate = useNavigate()

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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
      a.href = url
      a.download = `imagin-ai-${image.id}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  const handleReuse = () => {
    onClose()
    navigate('/', { state: { prompt: image.prompt } })
  }

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className={`${styles.modal} glass`}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <div className={styles.body}>
          <div className={styles.imageWrap}>
            <img src={image.url} alt={image.prompt} className={styles.image} />
          </div>

          <div className={styles.details}>
            <div className={styles.meta}>
              <span className={styles.metaTag}>{image.style}</span>
              <span className={styles.metaTag}>{image.size}</span>
            </div>

            <p className={styles.prompt}>{image.prompt}</p>

            <StarRating value={image.rating||0} onChange={r => setRating(image.id, r)} />

            <p className={styles.time}>{timeAgo(image.createdAt)}</p>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.primary}`} onClick={handleDownload}>
                <Download size={15} /> Download
              </button>
              <button className={styles.btn} onClick={handleReuse}>
                <RotateCcw size={15} /> Reuse Prompt
              </button>
              <button className={`${styles.btn} ${image.favorite ? styles.favActive : ''}`}
                onClick={() => toggleFavorite(image.id)}>
                <Heart size={15} fill={image.favorite ? '#A27B5C' : 'none'} />
                {image.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button className={`${styles.btn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
