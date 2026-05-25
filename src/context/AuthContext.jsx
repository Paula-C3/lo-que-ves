import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('loquevesusr')
      if (stored) setCurrentUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('loquevesusr')
    } finally {
      setAuthReady(true)
    }
  }, [])

  async function login(code, career) {
    const user = {
      id: 'a0000000-0000-0000-0000-000000000001',
      code,
      career,
      name: `Estudiante ${code.slice(-4)}`,
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
    localStorage.setItem('loquevesusr', JSON.stringify(user))
    setCurrentUser(user)
  }

  async function logout() {
    localStorage.removeItem('loquevesusr')
    setCurrentUser(null)
  }

  async function updateUserProfile(name, avatar) {
    const updated = { ...currentUser, name, avatar }
    localStorage.setItem('loquevesusr', JSON.stringify(updated))
    setCurrentUser(updated)
  }

  const isAdmin = currentUser?.code === '00325284'

  return (
    <AuthContext.Provider value={{ currentUser, authReady, isAdmin, login, logout, updateUser: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
