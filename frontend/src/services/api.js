import axios from 'axios'

const TOKEN_KEY = 'dc_session_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 65000,
})

// Ensure token is applied even after refresh/HMR before AuthProvider runs.
const bootToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
if (bootToken) {
  api.defaults.headers.common.Authorization = `Bearer ${bootToken}`
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }
  delete api.defaults.headers.common.Authorization
}

export async function generateImage(data) {
  const response = await api.post('/generate-image', data)
  return response.data
}

export async function getMyImages(params = {}) {
  const response = await api.get('/my-images', { params })
  return response.data
}

export async function signup(data) {
  const response = await api.post('/auth/signup', data)
  return response.data
}

export async function login(data) {
  const response = await api.post('/auth/login', data)
  return response.data
}

export async function getMe() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function logout() {
  const response = await api.post('/auth/logout')
  return response.data
}

export async function claimFreeTokens() {
  const response = await api.post('/auth/claim-free-tokens')
  return response.data
}

export async function getPackages() {
  const response = await api.get('/billing/packages')
  return response.data
}

export async function selectPackage(packageId) {
  const response = await api.post('/billing/select-package', { package_id: packageId })
  return response.data
}

export async function createCheckoutSession(packageId) {
  const response = await api.post('/billing/create-checkout-session', { package_id: packageId })
  return response.data
}

export async function getPaymentStatus(sessionId) {
  const response = await api.get(`/billing/payment-status/${sessionId}`)
  return response.data
}
