import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 65000,
})

export async function generateImage(data) {
  const response = await api.post('/generate-image', data)
  return response.data
}

