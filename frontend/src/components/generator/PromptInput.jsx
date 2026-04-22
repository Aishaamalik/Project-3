import { useState } from 'react'
import { Moon } from 'lucide-react'
import styles from './PromptInput.module.css'

export default function PromptInput({ value, onChange, suggestions }) {
  const [focused, setFocused] = useState(false)

  const appendSuggestion = (s) => {
    const trimmed = value.trim()
    onChange(trimmed ? `${trimmed}, ${s}` : s)
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.inputWrap} ${focused ? styles.focused : ''}`}>
        <Moon size={18} className={styles.icon} />
        <textarea
          className={styles.textarea}
          placeholder="Describe your moonlit vision..."
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          maxLength={500}
        />
        <span className={styles.count}>{value.length}/500</span>
      </div>
      <div className={styles.chips}>
        {suggestions.map(s => (
          <button key={s} className={styles.chip} onClick={() => appendSuggestion(s)}>{s}</button>
        ))}
      </div>
    </div>
  )
}
