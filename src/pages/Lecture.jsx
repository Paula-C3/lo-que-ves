import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AddTakeModal from '../components/AddTakeModal'
import { getLectureById } from '../lib/lecturesService'
import postsData from '../data/posts.json'

function formatDate(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function SocialIcon({ platform }) {
  const paths = {
    instagram: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm2 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm4-4.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>,
    linkedin: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>,
    twitter: <path d="M22 4a8 8 0 0 1-2.3.64 4 4 0 0 0 1.76-2.2 8 8 0 0 1-2.55.97 4 4 0 0 0-6.9 3.64A11.34 11.34 0 0 1 3.6 2.6a4 4 0 0 0 1.24 5.34 4 4 0 0 1-1.82-.5v.05a4 4 0 0 0 3.22 3.92 4 4 0 0 1-1.8.07 4 4 0 0 0 3.74 2.78 8 8 0 0 1-5 1.72 8.2 8.2 0 0 1-.95-.06 11.34 11.34 0 0 0 6.14 1.8c7.36 0 11.4-6.1 11.4-11.4 0-.17 0-.35-.02-.52A8.14 8.14 0 0 0 22 4z"/>,
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
      {paths[platform]}
    </svg>
  )
}

function PostCard({ post }) {
  if (post.type === 'image') {
    return (
      <div className="post-card post-image">
        <img src={post.content_url} alt="" className="post-image-src" loading="lazy" />
        <div className="post-body">
          <p className="post-caption">{post.caption}</p>
          <span className="post-timestamp">{post.timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="post-card post-text">
      <div className="post-body">
        <span className="post-quote">"</span>
        <p className="post-caption">{post.caption}</p>
        <span className="post-timestamp">{post.timestamp}</span>
      </div>
    </div>
  )
}

export default function Lecture() {
  const { currentUser } = useAuth()
  const { id } = useParams()
  const [lecture, setLecture] = useState(null)
  const [posts, setPosts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setPosts(postsData.filter(p => p.lecture_id === id))
  }, [id])

  useEffect(() => {
    getLectureById(id)
      .then(data => {
        setLecture(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (!currentUser) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="lecture-page">
        <Navbar />
        <div className="lecture-not-found">Cargando...</div>
      </div>
    )
  }

  if (error || !lecture) {
    return (
      <div className="lecture-page">
        <Navbar />
        <div className="lecture-not-found">Coloquio no encontrado.</div>
      </div>
    )
  }

  const { date, time } = formatDate(lecture.datetime)
  const isLive = lecture.status === 'live'
  const isUpcoming = lecture.status === 'upcoming'
  const isPast = lecture.status === 'past'

  function handleAddPost(post) {
    setPosts(prev => [post, ...prev])
  }

  return (
    <div className="lecture-page">
      <Navbar />

      <div
        className="lecture-banner"
        style={{ backgroundImage: `url(${lecture.banner})` }}
      >
        <div className="lecture-banner-overlay" />
        <div className="lecture-banner-content">
          {(isLive || isUpcoming) && (
            <div className="lecture-badge">
              {isLive && <span className="live-dot" />}
              <span className={`badge-text ${isUpcoming ? 'badge-upcoming' : ''}`}>
                {isLive ? 'EN VIVO' : 'PRÓXIMO'}
              </span>
            </div>
          )}
          <h1 className="lecture-title">{lecture.title}</h1>
          <p className="lecture-meta">
            <span>{lecture.classroom}</span>
            <span className="lecture-meta-sep">·</span>
            <span>{date}</span>
            <span className="lecture-meta-sep">·</span>
            <span>{time}</span>
          </p>
        </div>
      </div>

      <div className="lecture-metadata">
        <div className="lecture-description">
          <p>{lecture.description}</p>
        </div>
        <div className="lecture-speakers">
          <span className="speakers-label">Expositores</span>
          {lecture.speakers.map((s, i) => (
            <div key={i} className="speaker">
              <span className="speaker-name">{s.name}</span>
              <div className="speaker-links">
                <a href={s.instagram} className="social-link" aria-label="Instagram"><SocialIcon platform="instagram" /></a>
                <a href={s.linkedin} className="social-link" aria-label="LinkedIn"><SocialIcon platform="linkedin" /></a>
                <a href={s.twitter} className="social-link" aria-label="Twitter"><SocialIcon platform="twitter" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="lecture-feed-section">
        <h2 className="feed-heading">LO QUE VES</h2>
        <p className="feed-subline">Lo que otros se llevaron de este coloquio.</p>

        {posts.length === 0 ? (
          <p className="feed-empty">Aún no hay contribuciones. ¡Sé el primero en compartir!</p>
        ) : (
          <div className="feed-masonry">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {!isPast && (
        <button className="fab" onClick={() => setShowModal(true)} aria-label="Agregar aporte">
          +
        </button>
      )}

      {showModal && (
        <AddTakeModal
          lectureId={id}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddPost}
        />
      )}
    </div>
  )
}
