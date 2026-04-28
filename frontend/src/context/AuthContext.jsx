import { createContext, useContext, useState, useEffect } from 'react'
import { setAuthToken, login as apiLogin, signup as apiSignup, getMe, logout as apiLogout, claimFreeTokens } from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'dc_session_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }
    setAuthToken(token)
    getMe()
      .then((data) => {
        setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async ({ email: username, password }) => {
    const data = await apiLogin({ username, password })
    const token = data.token
    localStorage.setItem(TOKEN_KEY, token)
    setAuthToken(token)
    // fetch fresh user from /me
    const me = await getMe()
    setUser(me.user)
    if (!me.user.claimed_free_tokens) {
      setShowClaimModal(true)
    }
  }

  const signup = async ({ email: username, password }) => {
    await apiSignup({ username, password })
  }

  const logout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
  }

  // kept for API compatibility with LandingPage — not applicable without Firebase
  const requestPasswordReset = async () => {
    throw new Error('Password reset is not supported yet. Please contact support.')
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
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
