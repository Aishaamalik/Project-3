import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import styles from './KeyboardShortcutsModal.module.css'

const SHORTCUTS = [
  { group:'Generator',
    items:[
      { keys:['Ctrl','↵'], action:'Generate image' },
      { keys:['Ctrl','⇧','R'], action:'Regenerate last image' },
    ]
  },
  { group:'Navigation',
    items:[
      { keys:['G','H'], action:'Go to History' },
      { keys:['G','G'], action:'Go to Gallery' },
      { keys:['G','C'], action:'Go to Collections' },
    ]
  },
  { group:'Image Actions',
    items:[
      { keys:['Ctrl','D'], action:'Download image' },
      { keys:['Ctrl','F'], action:'Toggle favorite' },
      { keys:['Ctrl','C'], action:'Copy prompt' },
      { keys:['Esc'],      action:'Close modal' },
    ]
  },
]

export default function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    const h = (e) => { if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <motion.div className={styles.backdrop}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}>
      <motion.div className={`${styles.modal} glass`}
        initial={{ opacity:0, scale:0.92, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.92 }} transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
        onClick={e => e.stopPropagation()}>

        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16}/></button>
        </div>

        <div className={styles.body}>
          {SHORTCUTS.map(({ group, items }) => (
            <div key={group} className={styles.group}>
              <h3 className={styles.groupTitle}>{group}</h3>
              {items.map(({ keys, action }) => (
                <div key={action} className={styles.row}>
                  <span className={styles.action}>{action}</span>
                  <div className={styles.keys}>
                    {keys.map((k,i) => (
                      <span key={k}>
                        <kbd className={styles.key}>{k}</kbd>
                        {i < keys.length-1 && <span className={styles.plus}>+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
