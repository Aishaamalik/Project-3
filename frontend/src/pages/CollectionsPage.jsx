import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderOpen, Trash2, X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ImageModal from '../components/ImageModal'
import styles from './CollectionsPage.module.css'

const item = {
  hidden:  { opacity:0, y:20, scale:0.95 },
  visible: { opacity:1, y:0,  scale:1, transition:{ duration:0.4, ease:[0.16,1,0.3,1] } },
}

export default function CollectionsPage() {
  const { collections, history, createCollection, deleteCollection, assignCollection } = useApp()
  const [active, setActive]       = useState(null)   // active collection name
  const [newName, setNewName]     = useState('')
  const [creating, setCreating]   = useState(false)
  const [selected, setSelected]   = useState(null)   // modal image

  const handleCreate = () => {
    if (!newName.trim()) return
    createCollection(newName.trim())
    setNewName('')
    setCreating(false)
  }

  const collectionImages = (name) => history.filter(i => i.collection === name)

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <motion.div className={styles.header} initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Collections</h1>
            <span className={styles.count}>{collections.length} albums</span>
          </div>
          <motion.button className={styles.createBtn} onClick={() => setCreating(true)}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <Plus size={16}/> New Collection
          </motion.button>
        </motion.div>

        {/* Create input */}
        <AnimatePresence>
          {creating && (
            <motion.div className={`${styles.createBox} glass`}
              initial={{ opacity:0, y:-10, height:0 }} animate={{ opacity:1, y:0, height:'auto' }}
              exit={{ opacity:0, y:-10, height:0 }} transition={{ duration:0.25 }}>
              <input
                className={styles.createInput}
                placeholder="John Doe Collection"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter') handleCreate(); if(e.key==='Escape') setCreating(false) }}
                autoFocus
              />
              <button className={styles.confirmBtn} onClick={handleCreate}><Check size={16}/></button>
              <button className={styles.cancelBtn} onClick={() => setCreating(false)}><X size={16}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collection grid */}
        {active === null ? (
          <motion.div className={styles.grid}
            initial="hidden" animate="visible"
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}>
            {collections.map(col => {
              const imgs = collectionImages(col.name)
              return (
                <motion.div key={col.id} className={styles.colCard} variants={item}
                  whileHover={{ y:-5, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}
                  onClick={() => setActive(col.name)}>
                  <div className={styles.colCover}>
                    {imgs.slice(0,4).map((img,i) => (
                      <img key={img.id} src={img.url} alt="" className={styles.coverThumb}
                        style={{ gridArea: ['a','b','c','d'][i] }} />
                    ))}
                    {imgs.length === 0 && (
                      <div className={styles.emptyCover}><FolderOpen size={32} opacity={0.3}/></div>
                    )}
                  </div>
                  <div className={styles.colInfo}>
                    <span className={styles.colName}>{col.name}</span>
                    <span className={styles.colCount}>{imgs.length} image{imgs.length!==1?'s':''}</span>
                  </div>
                  <button className={styles.deleteColBtn}
                    onClick={e => { e.stopPropagation(); deleteCollection(col.id) }}>
                    <Trash2 size={13}/>
                  </button>
                </motion.div>
              )
            })}

            {collections.length === 0 && (
              <motion.div className={styles.empty} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <FolderOpen size={48} opacity={0.2}/>
                <p>No collections yet — create one above</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Collection detail view */
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.35 }}>
            <button className={styles.backBtn} onClick={() => setActive(null)}>
              ← Back to Collections
            </button>
            <h2 className={styles.colDetailTitle}>{active}</h2>
            <div className={styles.detailGrid}>
              {collectionImages(active).map((img, i) => (
                <motion.div key={img.id} className={styles.detailCard}
                  initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:i*0.04 }}
                  whileHover={{ y:-4 }}
                  onClick={() => setSelected(img)}>
                  <img src={img.url} alt={img.prompt} className={styles.detailImg} loading="lazy"/>
                  <div className={styles.detailOverlay}>
                    <p className={styles.detailPrompt}>{img.prompt}</p>
                  </div>
                  <button className={styles.removeFromCol}
                    onClick={e => { e.stopPropagation(); assignCollection(img.id, null) }}>
                    <X size={12}/>
                  </button>
                </motion.div>
              ))}
              {collectionImages(active).length === 0 && (
                <p className={styles.emptyDetail}>No images in this collection yet.<br/>Add them from History.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && <ImageModal image={selected} onClose={() => setSelected(null)}/>}
      </AnimatePresence>
    </main>
  )
}
