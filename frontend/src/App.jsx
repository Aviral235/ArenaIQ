import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CursorEffects from './components/CursorEffects'
import Landing from './pages/Landing'
import Arena from './pages/Arena'
import Dashboard from './pages/Dashboard'
import { Vote, Bias, Optimizer, Leaderboard } from './pages/OtherPages'

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated background blobs */}
      <div className="blob-container">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <CursorEffects />
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
