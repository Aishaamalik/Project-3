import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './StarRating.module.css'

export default function StarRating({ value = 0, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(star => (
        <motion.button
          key={star}
          className={`${styles.star} ${(hovered || value) >= star ? styles.active : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          whileHover={!readonly ? { scale: 1.3 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          disabled={readonly}
          type="button"
        >
          ★
        </motion.button>
      ))}
    </div>
  )
}
