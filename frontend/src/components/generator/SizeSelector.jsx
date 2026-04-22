import styles from './SizeSelector.module.css'

const SIZES = ['256x256', '512x512', '1024x1024']

export default function SizeSelector({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Size</label>
      <div className={styles.group}>
        {SIZES.map(s => (
          <button
            key={s}
            className={`${styles.btn} ${value === s ? styles.active : ''}`}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
