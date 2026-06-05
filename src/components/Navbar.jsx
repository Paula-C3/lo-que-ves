import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import brandSrc from '../assets/loquevesbrand.png'

export default function Navbar() {
  const { isAdmin, currentUser } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const isColor = currentUser?.avatar?.startsWith('#')
  const dotColor = isColor ? currentUser.avatar : '#FFD400'

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate(isAdmin ? '/dashboard' : '/home')}>
        {imgError ? (
          <span className="navbar-brand-fallback">LQV</span>
        ) : (
          <img
            src={brandSrc}
            alt="Lo Que Ves"
            className="navbar-logo"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="navbar-right">
        <span className="navbar-poli">POLI | Colegio de Ciencias e Ingeniería</span>
        {isAdmin ? (
          <button className="navbar-admin-back" onClick={() => navigate('/dashboard')}>
            ← PANEL
          </button>
        ) : (
          <Link to="/profile" className="nav-user">
            <span className="nav-user__dot" style={{ background: dotColor }} />
            <span className="nav-user__name">{currentUser?.name}</span>
            <svg className="nav-user__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="#FFFFFF" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        )}
      </div>
    </nav>
  )
}
