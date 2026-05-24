import { createContext, useContext, useState } from 'react'
import usersData from '../data/users.json'

const AuthContext = createContext(null)

const STORAGE_KEY = 'loquevesusr'

function generateId() {
  return 'guest_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  })

  function login(code, career) {
    const found = usersData.find(u => u.code === code)
    if (found) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
      setCurrentUser(found)
      return
    }
    const guest = {
      id: generateId(),
      code,
      career,
      name: `Estudiante ${code}`,
      avatar: `https://i.pravatar.cc/150?u=${code}`
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guest))
    setCurrentUser(guest)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }

  function updateUser(name, avatar) {
    const updated = { ...currentUser, name, avatar }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setCurrentUser(updated)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
