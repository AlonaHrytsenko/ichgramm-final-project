import axios from 'axios'

const base_url = 'http://localhost:5000'
export const socketURL = base_url
export const $api = axios.create({ baseURL: `${base_url}/api` })

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') // ???
  config.headers.Authorization = token ? `Bearer ${token}` : ''
  return config
})
