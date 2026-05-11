import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import styles from './PaymentSuccessPage.module.css' // reuse same styles

export default function PaymentCancelPage() {
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <XCircle className={styles.iconError} size={48} />
        <h1>Payment cancelled</h1>
        <p>No charge was made. You can go back and choose a package whenever you&apos;re ready.</p>
        <button type="button" className={styles.btn} onClick={() => navigate('/packages')}>
          Back to packages
        </button>
      </div>
    </main>
  )
}
