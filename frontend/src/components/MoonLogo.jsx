import { motion } from 'framer-motion'

export default function MoonLogo({ size = 32 }) {
  return (
    <motion.div
      style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      animate={{ filter: ['drop-shadow(0 0 6px rgba(162,123,92,0.28))', 'drop-shadow(0 0 16px rgba(220,215,201,0.42))', 'drop-shadow(0 0 6px rgba(162,123,92,0.28))'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Outer glow ring */}
        <motion.circle
          cx="16" cy="16" r="14"
          stroke="rgba(220,215,201,0.18)" strokeWidth="1"
          animate={{ r: [13, 14.5, 13], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Moon crescent */}
        <motion.path
          d="M20 8C16.686 8 14 10.686 14 14C14 17.314 16.686 20 20 20C20.74 20 21.45 19.87 22.11 19.63C20.85 21.07 19.03 22 17 22C13.134 22 10 18.866 10 15C10 11.134 13.134 8 17 8C18.07 8 19.08 8.26 19.97 8.72C19.98 8.72 20 8 20 8Z"
          fill="url(#moonGrad)"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Crater dots */}
        <motion.circle cx="15" cy="13" r="0.8" fill="rgba(220,215,201,0.34)"
          animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        <motion.circle cx="17.5" cy="16.5" r="0.5" fill="rgba(220,215,201,0.26)"
          animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
        {/* Stars around moon */}
        <motion.circle cx="24" cy="9" r="0.7" fill="#A27B5C"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
        <motion.circle cx="8" cy="22" r="0.5" fill="#DCD7C9"
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="25" cy="20" r="0.4" fill="#DCD7C9"
          animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }} />
        <defs>
          <linearGradient id="moonGrad" x1="10" y1="8" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DCD7C9" />
            <stop offset="50%" stopColor="#A27B5C" />
            <stop offset="100%" stopColor="#3F4E4F" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}
