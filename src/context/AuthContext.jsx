import { createContext, useContext, useState } from 'react'
import { getUserByCode, createUser, updateUser } from '../lib/usersService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('loquevesusr')
    return stored ? JSON.parse(stored) : null
  })

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
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser: updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
