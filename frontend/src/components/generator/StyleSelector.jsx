import styles from './StyleSelector.module.css'

const STYLES = [
  { value: 'realistic',   label: '📷 Realistic'   },
  { value: 'anime',       label: '🎌 Anime'        },
  { value: 'cinematic',   label: '🎬 Cinematic'    },
  { value: 'digital art', label: '🎨 Digital Art'  },
]

export default function StyleSelector({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Style</label>
      <div className={styles.group}>
        {STYLES.map(s => (
          <button
            key={s.value}
            className={`${styles.btn} ${value === s.value ? styles.active : ''}`}
            onClick={() => onChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
