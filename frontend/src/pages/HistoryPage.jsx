import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Search, Heart, Trash2, X, FolderPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ImageModal from '../components/ImageModal'
import StarRating from '../components/StarRating'
import styles from './HistoryPage.module.css'

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const cardVariants = {
  hidden:  { opacity:0, y:24, scale:0.95, filter:'blur(4px)' },
  visible: { opacity:1, y:0,  scale:1,    filter:'blur(0px)',
    transition: { duration:0.45, ease:[0.16,1,0.3,1] } },
}

export default function HistoryPage() {
  const { history, toggleFavorite, setRating, deleteImage, collections, assignCollection } = useApp()
  const [selected, setSelected] = useState(null)
  const [tab, setTab]           = useState('all')       // 'all' | 'favorites'
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('newest')    // 'newest' | 'rating'

  const filtered = useMemo(() => {
    let list = history
    if (tab === 'favorites') list = list.filter(i => i.favorite)
    if (search.trim()) list = list.filter(i => i.prompt.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'rating') list = [...list].sort((a,b) => (b.rating||0) - (a.rating||0))
    return list
  }, [history, tab, search, sortBy])

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <motion.div className={styles.header}
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>History</h1>
            <span className={styles.count}>{history.length} images</span>
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search creations"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}><X size={14}/></button>
            )}
          </div>

          {/* Tabs + Sort */}
          <div className={styles.controls}>
            <div className={styles.tabs}>
              {[['all','All'],['favorites','Favorites ♥']].map(([val,label]) => (
                <button key={val} className={`${styles.tab} ${tab===val ? styles.tabActive : ''}`}
                  onClick={() => setTab(val)}>{label}</button>
              ))}
            </div>
            <select className={styles.sort} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div className={styles.empty}
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
            <Clock size={48} className={styles.emptyIcon}/>
            <p>{tab === 'favorites' ? 'No favorites yet — heart an image!' : 'No results found'}</p>
          </motion.div>
        ) : (
          <motion.div className={styles.grid} variants={gridVariants} initial="hidden" animate="visible">
            <AnimatePresence>
              {filtered.map(img => (
                <motion.div key={img.id} className={styles.card}
                  variants={cardVariants} layout
                  exit={{ opacity:0, scale:0.9, transition:{ duration:0.2 } }}
                  whileHover={{ y:-6, boxShadow:'0 16px 48px rgba(0,0,0,0.6)' }}
                  whileTap={{ scale:0.97 }}
                  transition={{ type:'spring', stiffness:300, damping:20 }}>

                  <div className={styles.imageWrap} onClick={() => setSelected(img)}>
                    <img src={img.url} alt={img.prompt} className={styles.image} loading="lazy"/>
                    <div className={styles.overlay}>
                      <span className={styles.viewBtn}>View</span>
                    </div>
                    {img.favorite && (
                      <span className={styles.favBadge}>♥</span>
                    )}
                  </div>

                  <div className={styles.info}>
                    <p className={styles.prompt}>{img.prompt}</p>
                    <div className={styles.meta}>
                      <span className={styles.time}>{timeAgo(img.createdAt)}</span>
                      <StarRating value={img.rating||0} onChange={r => setRating(img.id, r)}/>
                    </div>
                    <div className={styles.cardActions}>
                      <button className={`${styles.iconBtn} ${img.favorite ? styles.favActive : ''}`}
                        onClick={() => toggleFavorite(img.id)} title="Favorite">
                        <Heart size={13} fill={img.favorite ? '#A27B5C' : 'none'}/>
                      </button>
                      <select className={styles.colSelect}
                        value={img.collection || ''}
                        onChange={e => assignCollection(img.id, e.target.value || null)}
                        title="Add to collection"
                        onClick={e => e.stopPropagation()}>
                        <option value="">No collection</option>
                        {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <button className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => deleteImage(img.id)} title="Delete">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && <ImageModal image={selected} onClose={() => setSelected(null)}/>}
      </AnimatePresence>
    </main>
  )
}
