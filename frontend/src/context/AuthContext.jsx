import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  reload,
  onAuthStateChanged,
} from 'firebase/auth'
import { setAuthToken, login as apiLogin, signup as apiSignup, getMe, logout as apiLogout, claimFreeTokens } from '../services/api'
import { firebaseAuth } from '../services/firebase'

const AuthContext = createContext(null)

const TOKEN_KEY = 'dc_session_token'

function normalizeIdentifier(raw) {
  return String(raw || '').trim().toLowerCase()
}

function verificationContinueUrl() {
  if (typeof window === 'undefined') return undefined
  return `${window.location.origin}/`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)

  // Restore session: backend token alone is not enough — must match Firebase user and verified email.
  useEffect(() => {
    let cancelled = false
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setAuthToken(null)
        setUser(null)
        if (!cancelled) setIsLoading(false)
        return
      }
      if (!fbUser) {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
        setUser(null)
        if (!cancelled) setIsLoading(false)
        return
      }
      await reload(fbUser)
      if (!fbUser.emailVerified) {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
        setUser(null)
        await firebaseSignOut(firebaseAuth)
        if (!cancelled) setIsLoading(false)
        return
      }
      setAuthToken(token)
      try {
        const data = await getMe()
        if (!cancelled) setUser(data.user)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
        setUser(null)
        await firebaseSignOut(firebaseAuth).catch(() => {})
      }
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const login = async ({ email: rawEmail, password }) => {
    const email = normalizeIdentifier(rawEmail)
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.')
    }
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    await reload(credential.user)
    if (!credential.user.emailVerified) {
      await firebaseSignOut(firebaseAuth)
      throw new Error('Please verify your email first, then log in.')
    }
    const data = await apiLogin({ username: email, password })
    const token = data.token
    localStorage.setItem(TOKEN_KEY, token)
    setAuthToken(token)
    const me = await getMe()
    setUser(me.user)
    if (!me.user.claimed_free_tokens) {
      setShowClaimModal(true)
    }
  }

  const signup = async ({ email: rawEmail, password }) => {
    const email = normalizeIdentifier(rawEmail)
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.')
    }
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    try {
      await apiSignup({ username: email, password })
    } catch (err) {
      try {
        await deleteUser(credential.user)
      } catch {
        /* best effort */
      }
      throw err
    }
    const continueUrl = verificationContinueUrl()
    try {
      if (continueUrl) {
        await sendEmailVerification(credential.user, { url: continueUrl, handleCodeInApp: false })
      } else {
        await sendEmailVerification(credential.user)
      }
    } catch (e) {
      await firebaseSignOut(firebaseAuth).catch(() => {})
      throw e
    }
    await firebaseSignOut(firebaseAuth)
  }

  const logout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    try {
      await firebaseSignOut(firebaseAuth)
    } catch {
      /* ignore */
    }
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
  }

  const requestPasswordReset = async (emailRaw) => {
    const email = normalizeIdentifier(emailRaw)
    if (!email.includes('@')) {
      throw new Error('Enter a valid email address.')
    }
    const url = verificationContinueUrl()
    if (url) {
      await sendPasswordResetEmail(firebaseAuth, email, { url, handleCodeInApp: false })
    } else {
      await sendPasswordResetEmail(firebaseAuth, email)
    }
  }

  const claimWelcomeTokens = async () => {
    try {
      await claimFreeTokens()
      const me = await getMe()
      setUser(me.user)
    } finally {
      setShowClaimModal(false)
    }
  }

  const refreshMe = async () => {
    try {
      const me = await getMe()
      setUser(me.user)
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      showClaimModal,
      setShowClaimModal,
      login,
      signup,
      logout,
      requestPasswordReset,
      claimWelcomeTokens,
      refreshMe,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
