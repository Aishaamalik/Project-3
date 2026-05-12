import axios from 'axios'

const TOKEN_KEY = 'dc_session_token'

const resolvedBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://project-3-u0k7.onrender.com' : 'http://localhost:8000')

const api = axios.create({
  baseURL: resolvedBaseUrl,
  // Render free tier can cold-start (~50s+). Login also performs a follow-up /me call.
  timeout: 120000,
})

let didRetryOnceAfterColdStart = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkish =
      !error?.response && (error?.code === 'ECONNABORTED' || error?.message === 'Network Error')

    if (isNetworkish && !didRetryOnceAfterColdStart) {
      didRetryOnceAfterColdStart = true
      try {
        return await api.request(error.config)
      } catch (retryErr) {
        throw retryErr
      }
    }

    throw error
  },
)

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
