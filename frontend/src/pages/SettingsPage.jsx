import { motion } from 'framer-motion'
import { Settings, Sliders, Shield, Palette, Keyboard } from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import * as Slider from '@radix-ui/react-slider'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import styles from './SettingsPage.module.css'

const STYLES = ['realistic','anime','cinematic','digital art']
const SIZES  = ['256x256','512x512','1024x1024']

const SHORTCUTS = [
  { keys:['Ctrl','Enter'],  action:'Generate image' },
  { keys:['Escape'],        action:'Close modal' },
  { keys:['Ctrl','D'],      action:'Download image' },
  { keys:['Ctrl','F'],      action:'Toggle favorite' },
  { keys:['Ctrl','C'],      action:'Copy prompt' },
  { keys:['←','→'],         action:'Navigate gallery' },
]

function Section({ icon:Icon, title, children }) {
  return (
    <motion.div className={`${styles.section} glass`}
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}>
      <div className={styles.sectionHeader}>
        <Icon size={16} className={styles.sectionIcon}/>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function Row({ label, sub, children }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span className={styles.rowTitle}>{label}</span>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings } = useApp()

  const save = () => toast.success('Settings saved!')

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Customize your DreamCanvas experience</p>
        </motion.div>

        {/* Generation defaults */}
        <Section icon={Sliders} title="Generation Defaults">
          <Row label="Default Style" sub="Applied when you open the generator">
            <div className={styles.optionGroup}>
              {STYLES.map(s => (
                <button key={s} className={`${styles.optBtn} ${settings.defaultStyle===s ? styles.optActive : ''}`}
                  onClick={() => updateSettings({ defaultStyle:s })}>
                  {s}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Default Size" sub="Default image dimensions">
            <div className={styles.optionGroup}>
              {SIZES.map(s => (
                <button key={s} className={`${styles.optBtn} ${settings.defaultSize===s ? styles.optActive : ''}`}
                  onClick={() => updateSettings({ defaultSize:s })}>
                  {s}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Output Quality" sub={`${settings.quality}% — higher quality, slower generation`}>
            <Slider.Root className={styles.slider} value={[settings.quality]}
              min={40} max={100} step={5}
              onValueChange={([v]) => updateSettings({ quality:v })}>
              <Slider.Track className={styles.sliderTrack}>
                <Slider.Range className={styles.sliderRange}/>
              </Slider.Track>
              <Slider.Thumb className={styles.sliderThumb}/>
            </Slider.Root>
          </Row>
          <Row label="Negative Prompt" sub="What to avoid in generations">
            <textarea
              className={styles.textarea}
              placeholder="blurry, low quality, watermark"
              value={settings.negativePrompt}
              onChange={e => updateSettings({ negativePrompt:e.target.value })}
              rows={2}
            />
          </Row>
        </Section>

        {/* Behaviour */}
        <Section icon={Settings} title="Behaviour">
          <Row label="Auto-save to History" sub="Automatically save every generated image">
            <Switch.Root className={styles.switch} checked={settings.autoSave}
              onCheckedChange={v => updateSettings({ autoSave:v })}>
              <Switch.Thumb className={styles.switchThumb}/>
            </Switch.Root>
          </Row>
          <Row label="NSFW Filter" sub="Filter potentially sensitive content">
            <Switch.Root className={styles.switch} checked={settings.showNSFWFilter}
              onCheckedChange={v => updateSettings({ showNSFWFilter:v })}>
              <Switch.Thumb className={styles.switchThumb}/>
            </Switch.Root>
          </Row>
        </Section>

        {/* Keyboard shortcuts */}
        <Section icon={Keyboard} title="Keyboard Shortcuts">
          <div className={styles.shortcuts}>
            {SHORTCUTS.map(({ keys, action }) => (
              <div key={action} className={styles.shortcutRow}>
                <span className={styles.shortcutAction}>{action}</span>
                <div className={styles.keys}>
                  {keys.map(k => <kbd key={k} className={styles.key}>{k}</kbd>)}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* About */}
        <Section icon={Palette} title="About">
          <div className={styles.about}>
            <div className={styles.aboutLogo}>🌙</div>
            <div>
              <p className={styles.aboutName}>DreamCanvas</p>
              <p className={styles.aboutVersion}>Version 1.0.0 — Moon Edition</p>
              <p className={styles.aboutDesc}>A premium AI image generation experience built with React, Framer Motion, and moonlight.</p>
            </div>
          </div>
        </Section>

        <motion.button className={styles.saveBtn} onClick={save}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
          Save Settings
        </motion.button>
      </div>
    </main>
  )
}
