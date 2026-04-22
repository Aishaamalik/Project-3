import { motion } from 'framer-motion'
import { Image, Heart, Star, Zap, TrendingUp, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import styles from './StatsPage.module.css'

const item = {
  hidden:  { opacity:0, y:20, scale:0.96 },
  visible: { opacity:1, y:0,  scale:1, transition:{ duration:0.45, ease:[0.16,1,0.3,1] } },
}
const container = { hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div className={styles.statCard} variants={item} whileHover={{ y:-4, boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
      <div className={styles.statIcon} style={{ background: color }}>
        <Icon size={18} />
      </div>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
        {sub && <span className={styles.statSub}>{sub}</span>}
      </div>
    </motion.div>
  )
}

export default function StatsPage() {
  const { stats, history } = useApp()
  const maxStyle = Math.max(...stats.byStyle.map(s=>s.count), 1)

  // Activity heatmap — last 28 days
  const days = Array.from({ length:28 }, (_,i) => {
    const d = new Date(Date.now() - (27-i)*86400000)
    const count = history.filter(img => {
      const c = new Date(img.createdAt)
      return c.toDateString() === d.toDateString()
    }).length
    return { date:d, count }
  })
  const maxDay = Math.max(...days.map(d=>d.count), 1)

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Your creative journey at a glance</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div className={styles.grid} variants={container} initial="hidden" animate="visible">
          <StatCard icon={Image}    label="Total Images"   value={stats.total}     sub={`${stats.thisWeek} this week`} color="rgba(220,215,201,0.15)" />
          <StatCard icon={Heart}    label="Favorites"      value={stats.favorites} sub={`${stats.total ? Math.round(stats.favorites/stats.total*100) : 0}% of total`} color="rgba(162,123,92,0.18)" />
          <StatCard icon={Star}     label="Avg Rating"     value={stats.avgRating} sub="out of 5 stars"  color="rgba(63,78,79,0.5)" />
          <StatCard icon={Zap}      label="This Week"      value={stats.thisWeek}  sub="new generations" color="rgba(52,211,153,0.15)" />
        </motion.div>

        <div className={styles.row}>
          {/* Style breakdown */}
          <motion.div className={`${styles.panel} glass`} variants={item} initial="hidden" animate="visible" transition={{ delay:0.3 }}>
            <div className={styles.panelHeader}>
              <TrendingUp size={16} className={styles.panelIcon} />
              <h2 className={styles.panelTitle}>Style Breakdown</h2>
            </div>
            <div className={styles.bars}>
              {stats.byStyle.map(({ style, count }) => (
                <div key={style} className={styles.barRow}>
                  <span className={styles.barLabel}>{style}</span>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      initial={{ width:0 }}
                      animate={{ width:`${(count/maxStyle)*100}%` }}
                      transition={{ duration:0.8, delay:0.4, ease:[0.16,1,0.3,1] }}
                    />
                  </div>
                  <span className={styles.barCount}>{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top tags */}
          <motion.div className={`${styles.panel} glass`} variants={item} initial="hidden" animate="visible" transition={{ delay:0.4 }}>
            <div className={styles.panelHeader}>
              <Tag size={16} className={styles.panelIcon} />
              <h2 className={styles.panelTitle}>Top Tags</h2>
            </div>
            {stats.topTags.length === 0
              ? <p className={styles.empty}>No tags yet</p>
              : <div className={styles.tagCloud}>
                  {stats.topTags.map(({ tag, count }) => (
                    <motion.span key={tag} className={styles.tagChip}
                      whileHover={{ scale:1.08 }}
                      style={{ fontSize: `${Math.max(11, Math.min(16, 11 + count*2))}px` }}>
                      {tag} <span className={styles.tagCount}>{count}</span>
                    </motion.span>
                  ))}
                </div>
            }
          </motion.div>
        </div>

        {/* Activity heatmap */}
        <motion.div className={`${styles.panel} glass`} variants={item} initial="hidden" animate="visible" transition={{ delay:0.5 }}>
          <div className={styles.panelHeader}>
            <Zap size={16} className={styles.panelIcon} />
            <h2 className={styles.panelTitle}>Activity — Last 28 Days</h2>
          </div>
          <div className={styles.heatmap}>
            {days.map((d, i) => (
              <motion.div
                key={i}
                className={styles.heatCell}
                title={`${d.date.toLocaleDateString()}: ${d.count} image${d.count!==1?'s':''}`}
                style={{ opacity: d.count === 0 ? 0.15 : 0.3 + (d.count/maxDay)*0.7 }}
                initial={{ scale:0 }}
                animate={{ scale:1 }}
                transition={{ delay: i*0.015, duration:0.3, ease:[0.16,1,0.3,1] }}
                whileHover={{ scale:1.4 }}
              />
            ))}
          </div>
          <div className={styles.heatLegend}>
            <span>Less</span>
            {[0.15,0.35,0.55,0.75,0.95].map(o => (
              <div key={o} className={styles.heatCell} style={{ opacity:o, position:'static', width:14, height:14 }} />
            ))}
            <span>More</span>
          </div>
        </motion.div>

        {/* Recent generations */}
        <motion.div className={`${styles.panel} glass`} variants={item} initial="hidden" animate="visible" transition={{ delay:0.6 }}>
          <div className={styles.panelHeader}>
            <Image size={16} className={styles.panelIcon} />
            <h2 className={styles.panelTitle}>Recent Generations</h2>
          </div>
          <div className={styles.recentGrid}>
            {history.slice(0,6).map((img, i) => (
              <motion.div key={img.id} className={styles.recentCard}
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.6+i*0.05 }} whileHover={{ scale:1.04 }}>
                <img src={img.url} alt={img.prompt} className={styles.recentImg} loading="lazy" />
                <div className={styles.recentOverlay}>
                  <span className={styles.recentStyle}>{img.style}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
