import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Lecture from './pages/Lecture'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useAuth()

  if (!authReady) return null

  if (!currentUser) return <Navigate to="/" replace />

  return children
}

function PublicRoute({ children }) {
  const { currentUser, authReady } = useAuth()

  if (!authReady) return null

  if (currentUser) return <Navigate to="/home" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/lecture/:id" element={<ProtectedRoute><Lecture /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
