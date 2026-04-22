import { motion } from 'framer-motion'

export default function AnimatedOrbs() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {/* Soft linen glow top-right */}
      <motion.div style={{
        position:'absolute', top:'-15%', right:'-8%',
        width:700, height:700, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(220,215,201,0.14) 0%, rgba(162,123,92,0.08) 42%, transparent 72%)',
        filter:'blur(60px)',
      }}
        animate={{ x:[0,-24,0], y:[0,20,0], scale:[1,1.05,1] }}
        transition={{ duration:24, repeat:Infinity, ease:'easeInOut' }}
      />
      {/* Warm clay glow bottom-left */}
      <motion.div style={{
        position:'absolute', bottom:'-10%', left:'-5%',
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(162,123,92,0.15) 0%, rgba(44,54,57,0.02) 58%, transparent 68%)',
        filter:'blur(50px)',
      }}
        animate={{ x:[0,28,0], y:[0,-22,0], scale:[1,1.08,1] }}
        transition={{ duration:20, repeat:Infinity, ease:'easeInOut', delay:2 }}
      />
      {/* Deep slate bloom left-center */}
      <motion.div style={{
        position:'absolute', top:'45%', left:'5%',
        width:300, height:300, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(63,78,79,0.24) 0%, rgba(220,215,201,0.03) 56%, transparent 72%)',
        filter:'blur(35px)',
      }}
        animate={{ x:[0,18,-12,0], y:[0,-16,12,0] }}
        transition={{ duration:16, repeat:Infinity, ease:'easeInOut', delay:1 }}
      />
      {/* Accent highlight top-left */}
      <motion.div style={{
        position:'absolute', top:'20%', left:'15%',
        width:150, height:150, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(220,215,201,0.12) 0%, rgba(162,123,92,0.06) 45%, transparent 72%)',
        filter:'blur(20px)',
      }}
        animate={{ scale:[1,1.22,1], opacity:[0.42,0.82,0.42] }}
        transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:2 }}
      />
    </div>
  )
}
