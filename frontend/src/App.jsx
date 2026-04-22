import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import GeneratorPage   from './pages/GeneratorPage'
import HistoryPage     from './pages/HistoryPage'
import GalleryPage     from './pages/GalleryPage'
import StatsPage       from './pages/StatsPage'
import CollectionsPage from './pages/CollectionsPage'
import SettingsPage    from './pages/SettingsPage'
import LandingPage     from './pages/LandingPage'
import ParticleBackground from './components/ParticleBackground'
import AnimatedOrbs    from './components/AnimatedOrbs'
import PageTransition  from './components/PageTransition'
import Footer          from './components/Footer'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"            element={<PageTransition><GeneratorPage/></PageTransition>}/>
        <Route path="/history"     element={<PageTransition><HistoryPage/></PageTransition>}/>
        <Route path="/gallery"     element={<PageTransition><GalleryPage/></PageTransition>}/>
        <Route path="/collections" element={<PageTransition><CollectionsPage/></PageTransition>}/>
        <Route path="/stats"       element={<PageTransition><StatsPage/></PageTransition>}/>
        <Route path="/settings"    element={<PageTransition><SettingsPage/></PageTransition>}/>
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  const { user } = useAuth()

  if (!user) {
    return (
      <>
        <ParticleBackground/>
        <AnimatedOrbs/>
        <LandingPage/>
      </>
    )
  }

  return (
    <>
      <ParticleBackground/>
      <AnimatedOrbs/>
      <Navbar/>
      <AnimatedRoutes/>
      <Footer/>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppShell/>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:'#3F4E4F', color:'#F4F0E8',
                border:'1px solid rgba(220,215,201,0.18)',
                borderRadius:'12px', fontSize:'14px',
                boxShadow:'0 8px 32px rgba(0,0,0,0.32)',
              },
              success: { iconTheme:{ primary:'#A27B5C', secondary:'#3F4E4F' } },
              error:   { iconTheme:{ primary:'#F87171', secondary:'#3F4E4F' } },
            }}
          />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
