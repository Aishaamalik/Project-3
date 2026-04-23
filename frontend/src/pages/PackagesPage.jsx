import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPackages, selectPackage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './PackagesPage.module.css'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const { refreshMe } = useAuth()

  useEffect(() => {
    getPackages()
      .then((res) => setPackages(res.packages || []))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  const resetCheckout = () => {
    setSelectedPackage(null)
    setCardName('')
    setCardNumber('')
    setExpiry('')
    setCvv('')
  }

  const formatCardNumber = (value) =>
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length < 3) return cleaned
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
  }

  const validateCheckout = () => {
    const cleanedNumber = cardNumber.replace(/\s/g, '')
    if (cardName.trim().length < 2) {
      toast.error('Please enter the name on card.')
      return false
    }
    if (cleanedNumber.length !== 16) {
      toast.error('Card number must be 16 digits.')
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error('Expiry must be in MM/YY format.')
      return false
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      toast.error('CVV must be 3 or 4 digits.')
      return false
    }
    return true
  }

  const handleSelectPackage = async (packageId) => {
    if (!validateCheckout()) return
    try {
      setPayingId(packageId)
      const res = await selectPackage(packageId)
      await refreshMe()
      toast.success(`${res.selected_package?.name || 'Package'} added successfully.`)
      resetCheckout()
    } catch (error) {
      const message = error?.response?.data?.detail || 'Could not select package.'
      toast.error(typeof message === 'string' ? message : 'Could not select package.')
    } finally {
      setPayingId(null)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <h1>Packages</h1>
        <p>Each generated image costs 10 tokens. Pick a package to continue creating.</p>

        {loading ? <p>Loading packages...</p> : null}

        <div className={styles.grid}>
          {packages.map((item) => (
            <article key={item.id} className={styles.card}>
              <h3>{item.name}</h3>
              <p className={styles.tokens}>{item.tokens} Tokens</p>
              <p className={styles.price}>${(item.price_cents / 100).toFixed(2)}</p>
              <button type="button" onClick={() => setSelectedPackage(item)}>
                Choose Package
              </button>
            </article>
          ))}
        </div>

        {selectedPackage ? (
          <section className={styles.checkout}>
            <div className={styles.checkoutHeader}>
              <h2>Card Payment</h2>
              <button type="button" className={styles.ghostBtn} onClick={resetCheckout}>
                Close
              </button>
            </div>

            <div className={styles.summary}>
              <p className={styles.summaryTitle}>{selectedPackage.name}</p>
              <p>{selectedPackage.tokens} tokens</p>
              <p className={styles.summaryPrice}>${(selectedPackage.price_cents / 100).toFixed(2)}</p>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                Name on card
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Malik Ahmed"
                  autoComplete="cc-name"
                />
              </label>

              <label className={styles.field}>
                Card number
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                />
              </label>

              <label className={styles.field}>
                Expiry (MM/YY)
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="12/28"
                  autoComplete="cc-exp"
                />
              </label>

              <label className={styles.field}>
                CVV
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.payBtn}
              disabled={payingId === selectedPackage.id}
              onClick={() => handleSelectPackage(selectedPackage.id)}
            >
              {payingId === selectedPackage.id ? 'Processing Payment...' : `Pay $${(selectedPackage.price_cents / 100).toFixed(2)}`}
            </button>
          </section>
        ) : null}
      </section>
    </main>
  )
}
