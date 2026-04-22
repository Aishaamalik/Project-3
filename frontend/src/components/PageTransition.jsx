import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 20, scale: 0.985, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -16, scale: 0.99, filter: 'blur(5px)' },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
