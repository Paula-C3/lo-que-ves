import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import brandSrc from '../assets/loquevesbrand.png'

export default function Navbar() {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/home')}>
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
        <button className="navbar-profile" onClick={() => navigate('/profile')} aria-label="Perfil">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 22c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
