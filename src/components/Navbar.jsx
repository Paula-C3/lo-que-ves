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
            <span className="nav-user__career">{currentUser?.career}</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
