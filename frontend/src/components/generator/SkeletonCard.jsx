import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={`${styles.card} glass`}>
      <div className={styles.image} />
      <div className={styles.footer}>
        <div className={styles.line} style={{ width: '80%' }} />
        <div className={styles.line} style={{ width: '55%' }} />
        <div className={styles.actions}>
          <div className={styles.btn} />
          <div className={styles.btn} />
          <div className={styles.btn} />
        </div>
      </div>
    </div>
  )
}
