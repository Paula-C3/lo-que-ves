import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, updateUser } from '../lib/usersService'

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

  const ADMIN_CODES = ['00325284', '00092037']

  async function login(code, career) {
    if (ADMIN_CODES.includes(code) && career === 'Administrador') {
      const adminUser = {
        id: 'admin',
        code,
        career,
        name: 'Administrador',
        avatar: 'https://i.pravatar.cc/150?img=1',
      }
      localStorage.setItem('loquevesusr', JSON.stringify(adminUser))
      setCurrentUser(adminUser)
      return { status: 'admin' }
    }

    const result = await loginUser(code, career)
    if (result.status === 'ok') {
      localStorage.setItem('loquevesusr', JSON.stringify(result.user))
      setCurrentUser(result.user)
    }
    return result
  }

  async function register(code, career) {
    const result = await registerUser(code, career)
    if (result.status === 'ok') {
      localStorage.setItem('loquevesusr', JSON.stringify(result.user))
      setCurrentUser(result.user)
    }
    return result
  }

  async function logout() {
    localStorage.removeItem('loquevesusr')
    setCurrentUser(null)
  }

  async function updateUserProfile(name, avatar) {
    const updated = await updateUser(currentUser.id, name, avatar)
    localStorage.setItem('loquevesusr', JSON.stringify(updated))
    setCurrentUser(updated)
  }

  const isAdmin = ADMIN_CODES.includes(currentUser?.code)

  return (
    <AuthContext.Provider value={{ currentUser, authReady, isAdmin, login, register, logout, updateUser: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
