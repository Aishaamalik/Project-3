import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Wand2, Layers, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { generateImage } from '../services/api'
import PromptInput from '../components/generator/PromptInput'
import StyleSelector from '../components/generator/StyleSelector'
import SizeSelector from '../components/generator/SizeSelector'
import GenerateButton from '../components/generator/GenerateButton'
import ResultCard from '../components/generator/ResultCard'
import SkeletonCard from '../components/generator/SkeletonCard'
import TypewriterText from '../components/TypewriterText'
import styles from './GeneratorPage.module.css'

const SUGGESTIONS = [
  'moonlit forest', 'lunar goddess', 'crescent moon', 'silver wolf',
  'night sky castle', 'moon crater', 'starlit ocean', 'eclipse ritual',
  'moon temple', 'celestial dragon',
]

const PROMPT_ENHANCERS = [
  { label:'Cinematic', append:'cinematic lighting, dramatic shadows, film grain, anamorphic lens' },
  { label:'Ethereal',  append:'ethereal glow, soft bokeh, dreamlike atmosphere, pastel hues' },
  { label:'Epic',      append:'epic scale, ultra-detailed, 8K resolution, award-winning photography' },
  { label:'Mystical',  append:'mystical fog, ancient runes, magical particles, moonlit ambiance' },
  { label:'Painterly', append:'oil painting style, impressionist brushstrokes, rich textures' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren:0.1 } },
}
const itemVariants = {
  hidden:  { opacity:0, y:28, filter:'blur(6px)' },
  visible: { opacity:1, y:0,  filter:'blur(0px)', transition:{ duration:0.6, ease:[0.16,1,0.3,1] } },
}

export default function GeneratorPage() {
  const { addToHistory, settings } = useApp()
  const [prompt, setPrompt]       = useState('')
  const [style, setStyle]         = useState(settings.defaultStyle || 'cinematic')
  const [size, setSize]           = useState(settings.defaultSize  || '512x512')
  const [loading, setLoading]     = useState(false)
  const [results, setResults]     = useState([])
  const [batchCount, setBatchCount] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [negPrompt, setNegPrompt] = useState(settings.negativePrompt || '')
  const [seed, setSeed]           = useState('')

  // Sync settings defaults
  useEffect(() => {
    setStyle(settings.defaultStyle)
    setSize(settings.defaultSize)
    setNegPrompt(settings.negativePrompt)
  }, [settings.defaultStyle, settings.defaultSize, settings.negativePrompt])

  const handleEnhance = (enhancer) => {
    const trimmed = prompt.trim()
    setPrompt(trimmed ? `${trimmed}, ${enhancer.append}` : enhancer.append)
    toast.success(`✨ ${enhancer.label} style applied!`)
  }

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt first'); return }
    setLoading(true)
    setResults([])

    const count = Math.min(batchCount, 4)

    try {
      const requests = Array.from({ length: count }, () =>
        generateImage({ prompt, style, size })
      )
      const responses = await Promise.all(requests)

      const newImages = responses.map((response, index) => ({
        id: Date.now() + index,
        url: response.image_url,
        prompt,
        style,
        size,
        createdAt: new Date(),
      }))

      setResults(newImages)
      newImages.forEach((img) => addToHistory(img))
      toast.success(count > 1 ? `${count} images generated!` : 'Image generated!')
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to generate image. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [prompt, style, size, batchCount, addToHistory])

  const handleKeyDown = (e) => {
    if (e.key==='Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Hero */}
        <motion.div className={styles.hero} variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <motion.div className={styles.badge}
              animate={{ boxShadow:['0 0 0px rgba(220,215,201,0)','0 0 20px rgba(162,123,92,0.35)','0 0 0px rgba(220,215,201,0)'] }}
              transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}>
              🎨 DreamCanvas Generator
            </motion.div>
          </motion.div>
          <motion.h1 className={styles.title} variants={itemVariants}><TypewriterText/></motion.h1>
          <motion.p className={styles.subtitle} variants={itemVariants}>
            Describe anything. Watch it come to life in seconds.
          </motion.p>
        </motion.div>

        {/* Generator card */}
        <motion.div className={`${styles.card} glass`}
          variants={itemVariants} initial="hidden" animate="visible" transition={{ delay:0.3 }}
          onKeyDown={handleKeyDown}
          whileHover={{ boxShadow:'0 0 40px rgba(162,123,92,0.12)' }}>

          <PromptInput value={prompt} onChange={setPrompt} suggestions={SUGGESTIONS}/>

          {/* Prompt enhancers */}
          <div className={styles.enhancers}>
            <span className={styles.enhancerLabel}><Wand2 size={12}/> Enhance:</span>
            {PROMPT_ENHANCERS.map(e => (
              <motion.button key={e.label} className={styles.enhancerChip}
                onClick={() => handleEnhance(e)}
                whileHover={{ scale:1.05, y:-1 }} whileTap={{ scale:0.95 }}>
                {e.label}
              </motion.button>
            ))}
          </div>

          <div className={styles.controls}>
            <StyleSelector value={style} onChange={setStyle}/>
            <SizeSelector  value={size}  onChange={setSize}/>
          </div>

          {/* Batch count */}
          <div className={styles.batchRow}>
            <span className={styles.batchLabel}><Layers size={13}/> Batch</span>
            <div className={styles.batchBtns}>
              {[1,2,3,4].map(n => (
                <button key={n} className={`${styles.batchBtn} ${batchCount===n ? styles.batchActive : ''}`}
                  onClick={() => setBatchCount(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* Advanced toggle */}
          <button className={styles.advancedToggle} onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            Advanced Options
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div className={styles.advanced}
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}>
                <div className={styles.advRow}>
                  <label className={styles.advLabel}>Negative Prompt</label>
                  <textarea className={styles.advTextarea} rows={2}
                    placeholder="What to avoid: blurry, low quality, watermark..."
                    value={negPrompt} onChange={e => setNegPrompt(e.target.value)}/>
                </div>
                <div className={styles.advRow}>
                  <label className={styles.advLabel}>Seed <span className={styles.advHint}>(leave blank for random)</span></label>
                  <input className={styles.advInput} placeholder="e.g. 42"
                    value={seed} onChange={e => setSeed(e.target.value)}/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <GenerateButton onClick={handleGenerate} loading={loading}/>
          <p className={styles.hint}>Press <kbd>Ctrl+Enter</kbd> to generate</p>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton"
              initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, scale:0.97 }} transition={{ duration:0.35 }}>
              <div className={batchCount > 1 ? styles.batchGrid : ''}>
                {Array.from({ length:batchCount }).map((_,i) => <SkeletonCard key={i}/>)}
              </div>
            </motion.div>
          )}
          {results.length > 0 && !loading && (
            <motion.div key="results"
              initial={{ opacity:0, scale:0.93, y:28, filter:'blur(8px)' }}
              animate={{ opacity:1, scale:1,    y:0,  filter:'blur(0px)' }}
              exit={{ opacity:0, scale:0.97 }}
              transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}>
              <div className={results.length > 1 ? styles.batchGrid : ''}>
                {results.map(img => <ResultCard key={img.id} image={img} onRegenerate={handleGenerate}/>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
