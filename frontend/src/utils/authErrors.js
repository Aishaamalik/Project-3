const FIREBASE_AUTH_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account was found with this email. Please sign up first.',
  'auth/wrong-password': 'Your password is incorrect. Please try again.',
  'auth/invalid-credential': 'Your email or password is incorrect. Please try again.',
  'auth/too-many-requests': 'Too many attempts right now. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network issue detected. Check your internet connection and try again.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/operation-not-allowed': 'This sign-in method is currently unavailable.',
  'auth/requires-recent-login': 'For security, please log in again and retry.',
}

const BACKEND_AUTH_MESSAGES = {
  'Invalid username or password.': 'Your email or password is incorrect. Please try again.',
  'Username already exists.': 'An account with this email already exists. Try logging in instead.',
  'Username is required.': 'Please enter your email address.',
  'Password is required.': 'Please enter your password.',
}

function extractFirebaseCode(error) {
  if (typeof error?.code === 'string' && error.code.startsWith('auth/')) {
    return error.code
  }

  const message = String(error?.message || '')
  const match = message.match(/auth\/[a-z-]+/i)
  return match ? match[0].toLowerCase() : null
}

export function getFriendlyAuthError(error, fallback = 'Authentication failed. Please try again.') {
  const backendDetail = error?.response?.data?.detail
  if (typeof backendDetail === 'string' && backendDetail.trim()) {
    return BACKEND_AUTH_MESSAGES[backendDetail] || backendDetail
  }

  const firebaseCode = extractFirebaseCode(error)
  if (firebaseCode && FIREBASE_AUTH_MESSAGES[firebaseCode]) {
    return FIREBASE_AUTH_MESSAGES[firebaseCode]
  }

  const message = String(error?.message || '').trim()
  if (message in BACKEND_AUTH_MESSAGES) {
    return BACKEND_AUTH_MESSAGES[message]
  }

  if (message && !/^Firebase:\s*Error/i.test(message)) {
    return message
  }

  return fallback
}
