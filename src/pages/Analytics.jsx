import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackToPanel from '../components/BackToPanel'
import { getTotalUsers, getPostsPerLecture, getLectureTitles } from '../lib/analyticsService'

export default function Analytics() {
  const navigate = useNavigate()
  const [totalUsers, setTotalUsers] = useState(0)
  const [lectureData, setLectureData] = useState([])
  const [totalContributions, setTotalContributions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      getTotalUsers(),
      getPostsPerLecture(),
      getLectureTitles(),
    ])
      .then(([users, counts, titles]) => {
        setTotalUsers(users)
        const all = Object.values(counts).reduce((s, v) => s + v, 0)
        setTotalContributions(all)
        const max = Math.max(...Object.values(counts), 1)
        const data = titles.map(t => ({
          ...t,
          count: counts[t.id] || 0,
          pct: ((counts[t.id] || 0) / max) * 100,
        }))
        setLectureData(data)
        setLoading(false)
        setTimeout(() => setReady(true), 50)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="analytics-page"><div className="page-status">Cargando métricas...</div></div>
  if (error) return <div className="analytics-page"><div className="page-status" style={{ color: '#FFD400' }}>{error}</div></div>

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="analytics-header-left">
          <span className="analytics-brand">ANALYTICS</span>
          <span className="analytics-brand-sub">/ Lo Que Ves</span>
        </div>
        <button className="analytics-back" onClick={() => navigate('/home')}>← VOLVER</button>
      </header>

      <div style={{ padding: '0 2rem' }}>
        <BackToPanel />
      </div>

      <div className="analytics-kpi-row">
        <div className="analytics-card">
          <span className="analytics-card-label">TOTAL LOGINS</span>
          <span className="analytics-card-number analytics-number-yellow">{totalUsers}</span>
          <span className="analytics-card-sub">usuarios registrados</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card-label">CONTRIBUCIONES</span>
          <span className="analytics-card-number">{totalContributions}</span>
          <span className="analytics-card-sub analytics-sub-yellow">aportes en todos los coloquios</span>
        </div>
      </div>

      <section className="analytics-chart-section">
        <h2 className="analytics-section-heading">APORTES POR COLOQUIO</h2>
        <div className="analytics-chart">
          {lectureData.map(l => (
            <div key={l.id} className="analytics-bar-row">
              <span className="analytics-bar-label">{l.title}</span>
              <div className="analytics-bar-track">
                <div
                  className={`analytics-bar-fill ${l.count === 0 ? 'empty' : ''}`}
                  style={{ width: ready ? `${Math.max(l.pct, 4)}%` : '0%' }}
                />
              </div>
              <span className="analytics-bar-count">{l.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
