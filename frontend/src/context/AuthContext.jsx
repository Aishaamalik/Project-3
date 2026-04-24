import { createContext, useContext, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  claimFreeTokens,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  setAuthToken,
  signup as signupRequest,
} from '../services/api'
import { firebaseAuth } from '../services/firebase'
import { getFriendlyAuthError } from '../utils/authErrors'

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

  const login = async ({ email, password }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const firebaseCred = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password)
      await firebaseCred.user.reload()

      if (!firebaseCred.user.emailVerified) {
        await sendEmailVerification(firebaseCred.user)
        await signOut(firebaseAuth)
        throw new Error('Please verify your email first. We sent you a new verification link.')
      }

      const data = await loginRequest({ username: normalizedEmail, password })
      applySession(data.token, data.user)
      return data.user
    } catch (error) {
      throw new Error(getFriendlyAuthError(error))
    }
  }

  const signup = async ({ email, password }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const firebaseCred = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password)

      try {
        await signupRequest({ username: normalizedEmail, password })
        await sendEmailVerification(firebaseCred.user)
        await signOut(firebaseAuth)
        return { requiresEmailVerification: true }
      } catch (error) {
        await deleteUser(firebaseCred.user).catch(() => undefined)
        throw error
      }
    } catch (error) {
      throw new Error(getFriendlyAuthError(error, 'Could not create your account. Please try again.'))
    }
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Ignore network/session errors during logout.
    } finally {
      await signOut(firebaseAuth).catch(() => undefined)
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
    [user, isLoading, login, signup, logout, refreshMe, showClaimModal, claimWelcomeTokens],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
