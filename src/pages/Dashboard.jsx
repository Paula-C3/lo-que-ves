import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import brandSrc from '../assets/loquevesbrand.png'

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {imgError ? (
          <div className="dashboard-brand-fallback">LO QUE VES</div>
        ) : (
          <img
            src={brandSrc}
            alt="Lo Que Ves"
            className="dashboard-brand"
            onError={() => setImgError(true)}
          />
        )}
        <h1 className="dashboard-title">PANEL DE ADMINISTRACIÓN</h1>
        <p className="dashboard-welcome">Bienvenido, administrador.</p>

        <div className="dashboard-menu">
          <div className="dashboard-card" onClick={() => navigate('/admin')}>
            <div className="dashboard-card-text">
              <span className="dashboard-card-title">COLOQUIOS</span>
              <span className="dashboard-card-desc">Gestiona y programa las charlas.</span>
            </div>
            <span className="dashboard-card-arrow">→</span>
          </div>

          <div className="dashboard-card" onClick={() => navigate('/analytics')}>
            <div className="dashboard-card-text">
              <span className="dashboard-card-title">ANALYTICS</span>
              <span className="dashboard-card-desc">Métricas de uso e interacción.</span>
            </div>
            <span className="dashboard-card-arrow">→</span>
          </div>
        </div>

        <button className="dashboard-logout" onClick={handleLogout}>CERRAR SESIÓN</button>
      </div>
    </div>
  )
}
