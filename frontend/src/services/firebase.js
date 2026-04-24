import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missingVars = requiredVars.filter((name) => !import.meta.env[name])
if (missingVars.length > 0) {
  throw new Error(`Missing Firebase env vars: ${missingVars.join(', ')}`)
}

const placeholderPatterns = [/^your[_-]/i, /^your-project-id/i]
const placeholderVars = requiredVars.filter((name) => {
  const value = String(import.meta.env[name] || '').trim()
  return placeholderPatterns.some((pattern) => pattern.test(value))
})

if (placeholderVars.length > 0) {
  throw new Error(
    `Firebase env vars still use placeholder values: ${placeholderVars.join(', ')}. ` +
      'Replace them with your real Firebase project credentials in frontend/.env.',
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)
