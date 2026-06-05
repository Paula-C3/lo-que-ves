import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getLectures, syncLectureStatuses } from '../lib/lecturesService'
import brandSrc from '../assets/loquevesbrand.png'

function formatDate(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function FeaturedCard({ lecture }) {
  const navigate = useNavigate()
  const isLive = lecture.status === 'live'
  const isBannerColor = lecture.banner?.startsWith('#')
  const { date, time } = formatDate(lecture.datetime)

  return (
    <div
      className={isLive ? 'lecture-card--live' : 'lecture-card--featured'}
      onClick={() => navigate(`/lecture/${lecture.id}`)}
    >
      <div className="live-card-banner" style={{
        backgroundImage: isBannerColor ? 'none' : `url(${lecture.banner})`,
        backgroundColor: isBannerColor ? lecture.banner : '#0A0A0A',
      }}>
        <div className="live-card-tint" />
        <div className="live-card-gradient" />
        <div className="live-card-badge">
          {isLive && <span className="live-dot" />}
          <span className={`badge-text ${isLive ? '' : 'badge-upcoming'}`}>
            {isLive ? 'EN VIVO' : 'PRÓXIMO'}
          </span>
        </div>
        <div className="live-card-info">
          <h3 className="live-card-title">{lecture.title}</h3>
          <p className="live-card-meta">
            <span>{lecture.classroom}</span>
            <span className="live-card-sep">·</span>
            <span>{date}</span>
            <span className="live-card-sep">·</span>
            <span>{time}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function UpcomingSection({ lectures }) {
  return (
    <section className="home-section">
      <h2 className="section-heading">PRÓXIMOS</h2>
      <div className="upcoming-grid">
        {lectures.map(l => {
          const isBannerColor = l.banner?.startsWith('#')
          const { date, time } = formatDate(l.datetime)
          return (
            <div key={l.id} className="lecture-card--upcoming">
              <div className="upcoming-card-banner" style={{
                backgroundImage: isBannerColor ? 'none' : `url(${l.banner})`,
                backgroundColor: isBannerColor ? l.banner : '#0A0A0A',
              }}>
                <div className="upcoming-card-gradient" />
                <span className="upcoming-badge">PRÓXIMO</span>
                <div className="upcoming-card-info">
                  <h3 className="upcoming-card-title">{l.title}</h3>
                  <span className="upcoming-card-date">{date} · {time}</span>
                </div>
                <div className="upcoming-hover-overlay">
                  <span className="upcoming-hover-text">Disponible pronto</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ArchiveSection({ lectures }) {
  const navigate = useNavigate()

  return (
    <section className="home-section">
      <h2 className="section-heading">ARCHIVO</h2>
      <div className="archive-list">
        {lectures.map(l => {
          const isBannerColor = l.banner?.startsWith('#')
          const { date } = formatDate(l.datetime)
          return (
            <div key={l.id} className="archive-row-card" onClick={() => navigate(`/lecture/${l.id}`)}>
              {isBannerColor ? (
                <div className="archive-row-thumb" style={{ background: l.banner }} />
              ) : (
                <img src={l.banner} alt="" className="archive-row-thumb" />
              )}
              <div className="archive-row-body">
                <h3 className="archive-row-title">{l.title}</h3>
                <span className="archive-row-meta">{l.classroom} · {date}</span>
              </div>
              <span className="archive-row-link">VER →</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Home() {
  const { currentUser } = useAuth()
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    syncLectureStatuses()
      .then(() => getLectures())
      .then(setLectures)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (!currentUser) return <Navigate to="/" replace />

  if (loading) return <div className="page-status">Cargando...</div>
  if (error) return <div className="page-status" style={{ color: '#FFD400' }}>{error}</div>

  const live = lectures.filter(l => l.status === 'live')
  const upcoming = lectures.filter(l => l.status === 'upcoming')
  const past = lectures.filter(l => l.status === 'past')
  const featured = live[0] || upcoming[0]

  return (
    <div className="home-page page-transition">
      <Navbar />

      <section className="home-hero">
        <div className="home-hero-left">
          <img src={brandSrc} alt="Lo Que Ves" className="home-hero-logo" />
          <p className="home-hero-tagline">En cada coloquio hay algo que te sirve.</p>
          <div className="hero-accent" />
        </div>
        {featured && (
          <div className="home-hero-right">
            <FeaturedCard lecture={featured} />
          </div>
        )}
      </section>

      {upcoming.length > 0 && <UpcomingSection lectures={upcoming} />}
      {past.length > 0 && <ArchiveSection lectures={past} />}
    </div>
  )
}
