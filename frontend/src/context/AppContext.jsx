import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  defaultStyle: 'cinematic',
  defaultSize: '512x512',
  autoSave: true,
  showNSFWFilter: true,
  quality: 80,
  negativePrompt: '',
}

const keyFor = (userId, suffix) => `dreamcanvas_${suffix}_${userId}`

const parseDateValue = (value) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [collections, setCollections] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!user?.id) {
      setHistory([])
      setCollections([])
      setSettings(DEFAULT_SETTINGS)
      return
    }

    const savedHistory = localStorage.getItem(keyFor(user.id, 'history'))
    const savedCollections = localStorage.getItem(keyFor(user.id, 'collections'))
    const savedSettings = localStorage.getItem(keyFor(user.id, 'settings'))

    try {
      const parsedHistory = savedHistory ? JSON.parse(savedHistory) : []
      setHistory(
        Array.isArray(parsedHistory)
          ? parsedHistory.map((item) => ({
              ...item,
              createdAt: parseDateValue(item.createdAt),
              rating: item.rating || 0,
              favorite: Boolean(item.favorite),
              tags: Array.isArray(item.tags) ? item.tags : [],
              collection: item.collection || null,
            }))
          : [],
      )
    } catch {
      setHistory([])
    }

    try {
      const parsedCollections = savedCollections ? JSON.parse(savedCollections) : []
      setCollections(Array.isArray(parsedCollections) ? parsedCollections : [])
    } catch {
      setCollections([])
    }

    try {
      const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {}
      setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
    } catch {
      setSettings(DEFAULT_SETTINGS)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    localStorage.setItem(keyFor(user.id, 'history'), JSON.stringify(history))
  }, [history, user?.id])

  useEffect(() => {
    if (!user?.id) return
    localStorage.setItem(keyFor(user.id, 'collections'), JSON.stringify(collections))
  }, [collections, user?.id])

  useEffect(() => {
    if (!user?.id) return
    localStorage.setItem(keyFor(user.id, 'settings'), JSON.stringify(settings))
  }, [settings, user?.id])

  const addToHistory = useCallback((item) =>
    setHistory(prev => [{ ...item, rating:0, favorite:false, tags:[], collection:null }, ...prev]), [])

  const toggleFavorite = useCallback((id) =>
    setHistory(prev => prev.map(img => img.id===id ? {...img, favorite:!img.favorite} : img)), [])

  const setRating = useCallback((id, rating) =>
    setHistory(prev => prev.map(img => img.id===id ? {...img, rating} : img)), [])

  const deleteImage = useCallback((id) =>
    setHistory(prev => prev.filter(img => img.id!==id)), [])

  const addTag = useCallback((id, tag) =>
    setHistory(prev => prev.map(img => img.id===id && !img.tags.includes(tag)
      ? {...img, tags:[...img.tags, tag]} : img)), [])

  const removeTag = useCallback((id, tag) =>
    setHistory(prev => prev.map(img => img.id===id
      ? {...img, tags:img.tags.filter(t=>t!==tag)} : img)), [])

  const assignCollection = useCallback((imageId, collectionName) =>
    setHistory(prev => prev.map(img => img.id===imageId ? {...img, collection:collectionName} : img)), [])

  const createCollection = useCallback((name) => {
    const id = 'c' + Date.now()
    setCollections(prev => [...prev, { id, name, cover:null, count:0, createdAt:new Date() }])
    return id
  }, [])

  const deleteCollection = useCallback((id) => {
    setCollections((prev) => {
      const target = prev.find((c) => c.id === id)
      if (target?.name) {
        setHistory((images) => images.map((img) => (img.collection === target.name ? { ...img, collection: null } : img)))
      }
      return prev.filter((c) => c.id !== id)
    })
  }, [])

  const updateSettings = useCallback((patch) =>
    setSettings(prev => ({...prev, ...patch})), [])

  // Computed stats
  const stats = {
    total:      history.length,
    favorites:  history.filter(i=>i.favorite).length,
    avgRating:  history.length ? (history.reduce((s,i)=>s+(i.rating||0),0)/history.length).toFixed(1) : 0,
    byStyle:    ['realistic','anime','cinematic','digital art'].map(s=>({
      style:s, count:history.filter(i=>i.style===s).length
    })),
    thisWeek:   history.filter(i=>(Date.now()-new Date(i.createdAt))< 7*86400000).length,
    topTags:    Object.entries(
      history.flatMap(i=>i.tags||[]).reduce((acc,t)=>{acc[t]=(acc[t]||0)+1;return acc},{})
    ).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([tag,count])=>({tag,count})),
  }

  return (
    <AppContext.Provider value={{
      history, addToHistory, toggleFavorite, setRating, deleteImage,
      addTag, removeTag, assignCollection,
      collections, createCollection, deleteCollection,
      settings, updateSettings,
      stats,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
