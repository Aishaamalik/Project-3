import { NavLink } from 'react-router-dom'
import MoonLogo from './MoonLogo'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <MoonLogo size={24}/>
          <span className={styles.name}>Dream<span className="gradient-text">Canvas</span></span>
        </div>
        <nav className={styles.links}>
          {[['/', 'Generate'], ['/gallery', 'Gallery'], ['/history', 'History'], ['/collections', 'Collections'], ['/stats', 'Stats']].map(([to, label]) => (
            <NavLink key={to} to={to} className={styles.link}>{label}</NavLink>
          ))}
        </nav>
        <p className={styles.copy}>© 2026 DreamCanvas · Built with moonlight & React</p>
      </div>
    </footer>
  )
}
