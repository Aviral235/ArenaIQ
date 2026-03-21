import axios from 'axios'

// Vite proxy forwards these to http://localhost:8000
const api = axios.create({ baseURL: '', timeout: 90000 })

export const runBattle        = (prompt, mA, mB) =>
  api.post('/arena/battle', { prompt, model_a: mA, model_b: mB })

export const predictOnly      = (prompt, ra, rb, mA = 'unknown', mB = 'unknown') =>
  api.post('/arena/predict', { prompt, response_a: ra, response_b: rb, model_a: mA, model_b: mB })

export const submitArenaVote  = (battleId, winner) =>
  api.post('/arena/vote', { battle_id: battleId, winner })

export const submitHumanVote  = (data) =>
  api.post('/vote', data)

export const optimizeResponse = (response, prompt, targetModel = 'llama-3.3-70b-versatile') =>
  api.post('/optimize', { response, prompt, target_model: targetModel })

export const getStats         = () => api.get('/stats')
export const getHistory       = (limit = 20, offset = 0) =>
  api.get(`/history?limit=${limit}&offset=${offset}`)
export const getLeaderboard   = () => api.get('/leaderboard')
export const getModels        = () => api.get('/models')

export default api
