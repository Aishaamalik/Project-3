import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

const DEMO_IMAGES = [
  { id:1,  url:'https://picsum.photos/seed/moon1/512/512',   prompt:'Crescent moon over a misty ancient forest at midnight',        style:'cinematic',   size:'512x512',  createdAt:new Date(Date.now()-3600000*2),  rating:5, favorite:true,  tags:['moon','forest','night'],    collection:'Lunar Dreams' },
  { id:2,  url:'https://picsum.photos/seed/lunar2/512/512',  prompt:'Lunar goddess standing on silver clouds under a full moon',    style:'digital art', size:'512x512',  createdAt:new Date(Date.now()-3600000*5),  rating:4, favorite:false, tags:['goddess','clouds','moon'],  collection:'Lunar Dreams' },
  { id:3,  url:'https://picsum.photos/seed/night3/512/768',  prompt:'Moonlit ocean with bioluminescent waves and star reflections', style:'realistic',   size:'512x768',  createdAt:new Date(Date.now()-3600000*8),  rating:5, favorite:true,  tags:['ocean','stars','night'],    collection:'Ocean Nights' },
  { id:4,  url:'https://picsum.photos/seed/wolf4/512/512',   prompt:'Silver wolf howling at a blood moon in a snowy tundra',       style:'anime',       size:'512x512',  createdAt:new Date(Date.now()-3600000*12), rating:3, favorite:false, tags:['wolf','moon','snow'],       collection:null },
  { id:5,  url:'https://picsum.photos/seed/castle5/512/512', prompt:'Gothic castle silhouette against a giant harvest moon',       style:'cinematic',   size:'512x512',  createdAt:new Date(Date.now()-3600000*20), rating:4, favorite:true,  tags:['castle','gothic','moon'],   collection:'Lunar Dreams' },
  { id:6,  url:'https://picsum.photos/seed/space6/512/512',  prompt:'Astronaut floating near the moon surface with Earth in view', style:'realistic',   size:'512x512',  createdAt:new Date(Date.now()-3600000*28), rating:5, favorite:false, tags:['space','astronaut','earth'],collection:'Space Odyssey' },
  { id:7,  url:'https://picsum.photos/seed/temple7/512/512', prompt:'Ancient moon temple with glowing runes and moonflowers',      style:'digital art', size:'512x512',  createdAt:new Date(Date.now()-3600000*36), rating:4, favorite:true,  tags:['temple','runes','magic'],   collection:'Lunar Dreams' },
  { id:8,  url:'https://picsum.photos/seed/eclipse8/512/512',prompt:'Total solar eclipse over a mystical stone circle',            style:'cinematic',   size:'512x512',  createdAt:new Date(Date.now()-3600000*48), rating:5, favorite:false, tags:['eclipse','stone','mystic'], collection:'Space Odyssey' },
]

const DEMO_COLLECTIONS = [
  { id:'c1', name:'Lunar Dreams',  cover:'https://picsum.photos/seed/moon1/200/200',  count:4, createdAt:new Date(Date.now()-86400000*3) },
  { id:'c2', name:'Ocean Nights',  cover:'https://picsum.photos/seed/night3/200/200', count:1, createdAt:new Date(Date.now()-86400000*2) },
  { id:'c3', name:'Space Odyssey', cover:'https://picsum.photos/seed/space6/200/200', count:2, createdAt:new Date(Date.now()-86400000*1) },
]

export function AppProvider({ children }) {
  const [history, setHistory]         = useState(DEMO_IMAGES)
  const [collections, setCollections] = useState(DEMO_COLLECTIONS)
  const [settings, setSettings]       = useState({
    defaultStyle: 'cinematic',
    defaultSize:  '512x512',
    autoSave:     true,
    showNSFWFilter: true,
    quality:      80,
    negativePrompt: '',
  })

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
    setCollections(prev => prev.filter(c => c.id!==id))
    setHistory(prev => prev.map(img => img.collection===collections.find(c=>c.id===id)?.name
      ? {...img, collection:null} : img))
  }, [collections])

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
