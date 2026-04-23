import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCZavgZ1_uIB9XWOQjeMN0jS_wageOpIlQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dreamcanvas-e38e5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dreamcanvas-e38e5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dreamcanvas-e38e5.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '356489278691',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:356489278691:web:040efc1af8a76e437881d6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Q9HYYNK897',
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)
