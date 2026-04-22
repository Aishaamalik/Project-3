import { useState, useEffect } from 'react'

const PHRASES = [
  'Paint the moonlit sky.',
  'Dream in silver and shadow.',
  'Conjure worlds by moonlight.',
  'Where night becomes art.',
  'Illuminate the darkness.',
]

export default function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting]   = useState(false)
  const [charIdx, setCharIdx]     = useState(0)

  useEffect(() => {
    const current = PHRASES[phraseIdx]
    let timeout

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx))
        setCharIdx(i => i + 1)
      }, charIdx === current.length ? 2000 : 48)
      if (charIdx === current.length + 1) { setDeleting(true); setCharIdx(current.length) }
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx))
        setCharIdx(i => i - 1)
      }, 22)
      if (charIdx === 0) { setDeleting(false); setPhraseIdx(i => (i+1) % PHRASES.length); setCharIdx(0) }
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, phraseIdx])

  return (
    <span>
      {displayed}
      <span style={{
        display:'inline-block', width:'2px', height:'0.85em',
        background:'var(--accent-gold)', marginLeft:'3px',
        verticalAlign:'text-bottom', borderRadius:'1px',
        animation:'blink 1s step-end infinite',
      }}/>
    </span>
  )
}
