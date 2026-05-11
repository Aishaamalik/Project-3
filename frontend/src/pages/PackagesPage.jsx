import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPackages, createCheckoutSession } from '../services/api'
import styles from './PackagesPage.module.css'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [redirectingId, setRedirectingId] = useState(null)

  useEffect(() => {
    getPackages()
      .then((res) => setPackages(res.packages || []))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  const handleBuy = async (packageId) => {
    try {
      setRedirectingId(packageId)
      const { checkout_url } = await createCheckoutSession(packageId)
      // Redirect to Stripe's hosted checkout page
      window.location.href = checkout_url
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not start checkout.'
      toast.error(typeof message === 'string' ? message : 'Could not start checkout.')
      setRedirectingId(null)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <h1>Packages</h1>
        <p>Each generated image costs 10 tokens. Pick a package to continue creating.</p>

        {loading ? <p>Loading packages…</p> : null}

        <div className={styles.grid}>
          {packages.map((item) => (
            <article key={item.id} className={styles.card}>
              <h3>{item.name}</h3>
              <p className={styles.tokens}>{item.tokens} Tokens</p>
              <p className={styles.price}>${(item.price_cents / 100).toFixed(2)}</p>
              <button
                type="button"
                disabled={redirectingId === item.id}
                onClick={() => handleBuy(item.id)}
              >
                {redirectingId === item.id ? 'Redirecting…' : 'Buy with Stripe'}
              </button>
            </article>
          ))}
        </div>

        <p className={styles.secureNote}>
          🔒 Payments are processed securely by{' '}
          <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">
            Stripe
          </a>
          . We never store your card details.
        </p>
      </section>
    </main>
  )
}
