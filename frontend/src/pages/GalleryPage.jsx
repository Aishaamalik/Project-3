import { useState, useEffect, useRef } from 'react'
import Masonry from 'react-masonry-css'
import { motion, AnimatePresence } from 'framer-motion'
import ImageModal from '../components/ImageModal'
import styles from './GalleryPage.module.css'

const generateGallery = () => {
  const seeds = [
    ['moon1',    'Crescent moon over a misty ancient forest at midnight'],
    ['lunar2',   'Lunar goddess standing on silver clouds under a full moon'],
    ['night3',   'Moonlit ocean with bioluminescent waves and star reflections'],
    ['wolf4',    'Silver wolf howling at a blood moon in a snowy tundra'],
    ['castle5',  'Gothic castle silhouette against a giant harvest moon'],
    ['space6',   'Astronaut floating near the moon surface with Earth in view'],
    ['temple7',  'Ancient moon temple with glowing runes and moonflowers'],
    ['eclipse8', 'Total solar eclipse over a mystical stone circle'],
    ['mermaid9', 'Moonlit mermaid resting on silver coral reef'],
    ['dragon10', 'Celestial dragon coiling around a full moon'],
    ['witch11',  'Moon witch casting silver spells in a midnight garden'],
    ['crater12', 'Alien landscape on the moon with Earth rising'],
    ['forest13', 'Enchanted forest bathed in silver moonlight'],
    ['phoenix14','Silver phoenix rising from moonbeams at midnight'],
    ['ocean15',  'Moonlit sea with a lone lighthouse and shooting stars'],
    ['spirit16', 'Moon spirit dancing among cherry blossoms at night'],
  ]
  const sizes = [[400,500],[400,600],[400,400],[400,550],[400,480],[400,620],[400,400],[400,530]]
  return seeds.map(([seed, prompt], i) => {
    const [w, h] = sizes[i % sizes.length]
    return { id: i + 1, url: `https://picsum.photos/seed/${seed}/${w}/${h}`, prompt, style: 'cinematic', size: `${w}x${h}`, createdAt: new Date(Date.now() - i * 3600000) }
  })
}

const ALL_IMAGES = generateGallery()
const PAGE_SIZE  = 8

export default function GalleryPage() {
  const [images, setImages]     = useState(ALL_IMAGES.slice(0, PAGE_SIZE))
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(false)
  const loaderRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && images.length < ALL_IMAGES.length && !loading) {
        setLoading(true)
        setTimeout(() => {
          setImages(prev => ALL_IMAGES.slice(0, prev.length + PAGE_SIZE))
          setLoading(false)
        }, 800)
      }
    }, { threshold: 0.1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [images.length, loading])

  const breakpoints = { default: 4, 1100: 3, 768: 2, 480: 1 }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className={styles.title}>Explore</h1>
          <span className={styles.subtitle}>Community creations</span>
        </motion.div>

        <Masonry
          breakpointCols={breakpoints}
          className={styles.masonry}
          columnClassName={styles.masonryCol}
        >
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30, scale: 0.94, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: (i % PAGE_SIZE) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelected(img)}
              whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.imageWrap}>
                <img src={img.url} alt={img.prompt} className={styles.image} loading="lazy" />
                <motion.div
                  className={styles.overlay}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className={styles.overlayPrompt}>{img.prompt}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </Masonry>

        <div ref={loaderRef} className={styles.loader}>
          <AnimatePresence>
            {loading && (
              <motion.div
                className={styles.loadingDots}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span /><span /><span />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selected && <ImageModal image={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </main>
  )
}
