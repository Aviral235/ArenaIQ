import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Arena from './pages/Arena'
import Dashboard from './pages/Dashboard'
import { Vote, Bias, Optimizer, Leaderboard } from './pages/OtherPages'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/arena"       element={<Arena />} />
        <Route path="/vote"        element={<Vote />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/bias"        element={<Bias />} />
        <Route path="/optimizer"   element={<Optimizer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  )
}
