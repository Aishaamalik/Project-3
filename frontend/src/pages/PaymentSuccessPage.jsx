import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { getPaymentStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './PaymentSuccessPage.module.css'

const MAX_POLLS = 12   // ~24 seconds
const POLL_MS   = 2000

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshMe } = useAuth()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState('polling') // 'polling' | 'completed' | 'pending' | 'error'
  const [tokensAwarded, setTokensAwarded] = useState(null)
  const pollCount = useRef(0)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const poll = async () => {
      try {
        const data = await getPaymentStatus(sessionId)
        if (data.status === 'completed') {
          setTokensAwarded(data.tokens_awarded)
          setStatus('completed')
          // Refresh user tokens in the navbar
          if (refreshMe) await refreshMe()
          return
        }
        // Still pending — keep polling
        pollCount.current += 1
        if (pollCount.current >= MAX_POLLS) {
          setStatus('pending')
          return
        }
        setTimeout(poll, POLL_MS)
      } catch {
        setStatus('error')
      }
    }

    poll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {status === 'polling' && (
          <>
            <Loader2 className={styles.spinner} size={48} />
            <h1>Confirming your payment…</h1>
            <p>Please wait while we verify your transaction with Stripe.</p>
          </>
        )}

        {status === 'completed' && (
          <>
            <CheckCircle className={styles.iconSuccess} size={48} />
            <h1>Payment successful!</h1>
            <p>
              <strong>{tokensAwarded} tokens</strong> have been added to your account.
            </p>
            <button type="button" className={styles.btn} onClick={() => navigate('/')}>
              Start generating
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <Loader2 className={styles.spinner} size={48} />
            <h1>Payment is being processed</h1>
            <p>
              Your payment is still being confirmed. Tokens will appear in your account
              shortly. You can safely close this page.
            </p>
            <button type="button" className={styles.btn} onClick={() => navigate('/')}>
              Go home
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className={styles.iconError} size={48} />
            <h1>Something went wrong</h1>
            <p>
              We could not verify your payment. If you were charged, please contact
              support with your session ID: <code>{sessionId}</code>
            </p>
            <button type="button" className={styles.btn} onClick={() => navigate('/packages')}>
              Back to packages
            </button>
          </>
        )}
      </div>
    </main>
  )
}
