import { createContext, useContext, useState, useEffect } from 'react'
import { getUserByCode, createUser, updateUser } from '../lib/usersService'

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
    let user = await getUserByCode(code)
    if (!user) {
      user = await createUser(code, career)
    }
    localStorage.setItem('loquevesusr', JSON.stringify(user))
    setCurrentUser(user)
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

  return (
    <AuthContext.Provider value={{ currentUser, authReady, login, logout, updateUser: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
