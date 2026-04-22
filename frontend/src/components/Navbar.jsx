import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Settings, Keyboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MoonLogo from './MoonLogo'
import MoonPhase from './MoonPhase'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

const links = [
  { to:'/',            label:'Generate'    },
  { to:'/history',     label:'History'     },
  { to:'/gallery',     label:'Gallery'     },
  { to:'/collections', label:'Collections' },
  { to:'/stats',       label:'Stats'       },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <>
      <motion.header className={styles.header}
        initial={{ y:-64, opacity:0 }} animate={{ y:0, opacity:1 }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}>
        <nav className={styles.nav}>

          <NavLink to="/" className={styles.logo}>
            <MoonLogo size={34}/>
            <span className={styles.logoText}>Dream<span className="gradient-text">Canvas</span></span>
          </NavLink>

          <ul className={styles.links}>
            {links.map(l => {
              const isActive = l.to==='/' ? location.pathname==='/' : location.pathname.startsWith(l.to)
              return (
                <li key={l.to} style={{ position:'relative' }}>
                  <NavLink to={l.to} end={l.to==='/'} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                    {l.label}
                  </NavLink>
                  {isActive && (
                    <motion.div className={styles.activeBar} layoutId="activeBar"
                      transition={{ type:'spring', stiffness:380, damping:30 }}/>
                  )}
                </li>
              )
            })}
          </ul>

          <div className={styles.right}>
            <div className={styles.desktopOnly}><MoonPhase/></div>
            {user && (
              <span className={styles.username}>👤 {user.username}</span>
            )}
            <motion.button className={styles.iconBtn} onClick={() => setShowKeys(true)}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.9 }} title="Keyboard shortcuts">
              <Keyboard size={16}/>
            </motion.button>
            <NavLink to="/settings" className={({ isActive }) => `${styles.iconBtn} ${isActive ? styles.iconActive : ''}`}>
              <Settings size={16}/>
            </NavLink>
            {user && (
              <motion.button className={`${styles.iconBtn} ${styles.logoutBtn}`}
                onClick={logout} whileHover={{ scale:1.05 }} whileTap={{ scale:0.9 }} title="Log out">
                <LogOut size={16}/>
              </motion.button>
            )}
            <motion.button className={styles.menuBtn} onClick={() => setOpen(o => !o)} whileTap={{ scale:0.9 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={open?'x':'menu'}
                  initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }}
                  exit={{ rotate:90, opacity:0 }} transition={{ duration:0.15 }}>
                  {open ? <X size={20}/> : <Menu size={20}/>}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div className={styles.drawer}
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }} transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}>
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
                  <NavLink to={l.to} end={l.to==='/'} onClick={() => setOpen(false)}
                    className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.active : ''}`}>
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <NavLink to="/settings" onClick={() => setOpen(false)}
                className={({ isActive }) => `${styles.drawerLink} ${isActive ? styles.active : ''}`}>
                Settings
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {showKeys && <KeyboardShortcutsModal onClose={() => setShowKeys(false)}/>}
      </AnimatePresence>
    </>
  )
}
