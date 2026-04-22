import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  claimFreeTokens,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  signup as signupRequest,
} from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'dreamcanvas_auth_token'

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem(STORAGE_KEY)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(initialToken))
  const [showClaimModal, setShowClaimModal] = useState(false)

  useEffect(() => {
    if (!initialToken) {
      return
    }

    setAuthToken(initialToken)
    getMe()
      .then((data) => {
        setUser(data.user)
        if (!data.user.claimed_free_tokens) {
          setShowClaimModal(true)
        }
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [initialToken])

  const applySession = (token, nextUser) => {
    localStorage.setItem(STORAGE_KEY, token)
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
      localStorage.removeItem(STORAGE_KEY)
      setAuthToken(null)
      setUser(null)
      setShowClaimModal(false)
    }
  }

  const refreshMe = async () => {
    const data = await getMe()
    setUser(data.user)
    return data.user
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
      refreshMe,
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
