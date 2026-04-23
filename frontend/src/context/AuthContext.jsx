import { createContext, useContext, useMemo, useState } from 'react'
import {
  claimFreeTokens,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  signup as signupRequest,
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)

  const applySession = (token, nextUser) => {
    setAuthToken(token)
    setUser(nextUser)
    if (!nextUser.claimed_free_tokens) {
      setShowClaimModal(true)
    }
  }

  const login = async ({ username, password }) => {
    const data = await loginRequest({ username, password })
    applySession(data.token, data.user)
    return data.user
  }

  const signup = async ({ username, password }) => {
    const data = await signupRequest({ username, password })
    applySession(data.token, data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Ignore network/session errors during logout.
    } finally {
      setAuthToken(null)
      setUser(null)
      setShowClaimModal(false)
    }
  }

  const claimWelcomeTokens = async () => {
    const data = await claimFreeTokens()
    setUser((prev) => (prev ? { ...prev, tokens: data.tokens, claimed_free_tokens: data.claimed_free_tokens } : prev))
    setShowClaimModal(false)
    return data
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      showClaimModal,
      setShowClaimModal,
      claimWelcomeTokens,
    }),
    [user, isLoading, showClaimModal],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
