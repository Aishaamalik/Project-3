import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { Gift, Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import GeneratorPage   from './pages/GeneratorPage'
import HistoryPage     from './pages/HistoryPage'
import GalleryPage     from './pages/GalleryPage'
import StatsPage       from './pages/StatsPage'
import CollectionsPage from './pages/CollectionsPage'
import SettingsPage    from './pages/SettingsPage'
import LandingPage     from './pages/LandingPage'
import PackagesPage    from './pages/PackagesPage'
import ParticleBackground from './components/ParticleBackground'
import AnimatedOrbs    from './components/AnimatedOrbs'
import PageTransition  from './components/PageTransition'
import Footer          from './components/Footer'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

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
        <Route path="/packages"    element={<PageTransition><PackagesPage/></PageTransition>}/>
      </Routes>
    </AnimatePresence>
  )
}

function ClaimTokensModal() {
  const { showClaimModal, claimWelcomeTokens, setShowClaimModal } = useAuth()
  if (!showClaimModal) return null

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Claim your 100 free tokens</h2>
        <p style={{ opacity: 0.85 }}>Use them to generate up to 10 images right away.</p>
        <button
          type="button"
          style={buttonStyle}
          onClick={async () => {
            await claimWelcomeTokens()
          }}
        >
          <Gift size={16} />
          Claim your 100 free tokens
        </button>
        <button type="button" style={ghostButtonStyle} onClick={() => setShowClaimModal(false)}>
          Later
        </button>
      </div>
    </div>
  )
}

function AppShell() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={loadingWrapStyle}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

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
      <ClaimTokensModal />
    </>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 9999,
  padding: '1rem',
}

const cardStyle = {
  width: 'min(100%, 420px)',
  background: '#1f2a2b',
  color: '#f4f0e8',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px',
  padding: '1.25rem',
}

const buttonStyle = {
  width: '100%',
  marginTop: '1rem',
  border: 'none',
  borderRadius: '10px',
  padding: '0.75rem 1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  fontWeight: 600,
  background: '#a27b5c',
  color: '#fff',
  cursor: 'pointer',
}

const ghostButtonStyle = {
  width: '100%',
  marginTop: '0.5rem',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '10px',
  padding: '0.65rem 1rem',
  background: 'transparent',
  color: '#f4f0e8',
  cursor: 'pointer',
}

const loadingWrapStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  color: '#f4f0e8',
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
