import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import lecturesData from '../data/lectures.json'
import brandSrc from '../assets/loquevesbrand.png'

function formatDate(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function Hero() {
  const [imgError, setImgError] = useState(false)

  return (
    <section className="hero-section">
      {imgError ? (
        <div className="hero-fallback">LO QUE VES</div>
      ) : (
        <img
          src={brandSrc}
          alt="Lo Que Ves"
          className="hero-image"
          onError={() => setImgError(true)}
        />
      )}
      <p className="hero-tagline">En cada coloquio hay algo que te sirve.</p>
      <div className="hero-accent" />
    </section>
  )
}

function FeaturedLecture({ lecture }) {
  const navigate = useNavigate()
  const { date, time } = formatDate(lecture.datetime)
  const isLive = lecture.status === 'live'

  return (
    <section className="featured-section">
      <h2 className="section-heading">AHORA</h2>
      <div className="featured-card" onClick={() => navigate(`/lecture/${lecture.id}`)}>
        <div className="featured-banner" style={{ backgroundImage: `url(${lecture.banner})` }}>
          <div className="featured-overlay" />
          <div className="featured-badge">
            {isLive ? (
              <>
                <span className="live-dot" />
                <span className="badge-text">EN VIVO</span>
              </>
            ) : (
              <span className="badge-text badge-upcoming">PRÓXIMO</span>
            )}
          </div>
          <div className="featured-info">
            <h3 className="featured-title">{lecture.title}</h3>
            <p className="featured-meta">
              <span>{lecture.classroom}</span>
              <span className="featured-meta-sep">·</span>
              <span>{date}</span>
              <span className="featured-meta-sep">·</span>
              <span>{time}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Archive({ lectures }) {
  return (
    <section className="archive-section">
      <h2 className="section-heading">ARCHIVO</h2>
      <div className="archive-row">
        {lectures.map(l => <ArchiveCard key={l.id} lecture={l} />)}
      </div>
    </section>
  )
}

function ArchiveCard({ lecture }) {
  const navigate = useNavigate()
  const { date } = formatDate(lecture.datetime)

  return (
    <div className="archive-card" onClick={() => navigate(`/lecture/${lecture.id}`)}>
      <div className="archive-card-banner" style={{ backgroundImage: `url(${lecture.banner})` }}>
        <div className="archive-card-overlay" />
        <div className="archive-card-info">
          <h3 className="archive-card-title">{lecture.title}</h3>
          <p className="archive-card-date">{date}</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/" replace />

  const live = lecturesData.find(l => l.status === 'live')
  const upcoming = lecturesData.find(l => l.status === 'upcoming')
  const featured = live || upcoming
  const past = lecturesData.filter(l => l.status === 'past')

  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      {featured && <FeaturedLecture lecture={featured} />}
      {past.length > 0 && <Archive lectures={past} />}
    </div>
  )
}
