import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPackages, selectPackage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './PackagesPage.module.css'

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const { refreshMe } = useAuth()

  useEffect(() => {
    getPackages()
      .then((res) => setPackages(res.packages || []))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectPackage = async (packageId) => {
    try {
      setPayingId(packageId)
      const res = await selectPackage(packageId)
      await refreshMe()
      toast.success(`${res.selected_package?.name || 'Package'} added successfully.`)
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
              <button type="button" disabled={payingId === item.id} onClick={() => handleSelectPackage(item.id)}>
                {payingId === item.id ? 'Selecting...' : 'Select Package'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
