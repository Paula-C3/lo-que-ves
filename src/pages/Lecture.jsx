import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AddTakeModal from '../components/AddTakeModal'
import { getLectureById } from '../lib/lecturesService'
import { getPostsByLecture } from '../lib/postsService'
import { supabase } from '../lib/supabase'
import { trackEvent, trackTimeSpent } from '../lib/analytics'

function formatDate(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function PostCard({ post }) {
  const isNew = post.timestamp_label === 'ahora mismo'

  if (post.type === 'image') {
    return (
      <div className={`post-card post-image${isNew ? ' post-card--new' : ''}`}>
        <img src={post.content_url} alt="" className="post-image-src" loading="lazy" />
        <div className="post-body">
          <p className="post-caption">{post.caption}</p>
          <span className="post-timestamp">{post.timestamp_label}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`post-card post-text${isNew ? ' post-card--new' : ''}`}>
      <div className="post-body">
        <span className="post-quote">"</span>
        <p className="post-caption">{post.caption}</p>
        <span className="post-timestamp">{post.timestamp_label}</span>
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
  const [showTooltip, setShowTooltip] = useState(() => {
    return !localStorage.getItem('fab_tooltip_seen')
  })

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false)
        localStorage.setItem('fab_tooltip_seen', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showTooltip])

  useEffect(() => {
    getPostsByLecture(id)
      .then(setPosts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getLectureById(id)
      .then(setLecture)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!lecture) return
    const start = Date.now()
    return () => {
      const seconds = Math.round((Date.now() - start) / 1000)
      trackTimeSpent('lecture_' + lecture.title, seconds)
    }
  }, [lecture])

  useEffect(() => {
    const channel = supabase
      .channel('posts-' + id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (payload.new.lecture_id === id) {
            setPosts(prev => [payload.new, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .subscribe((status, err) => {
        console.log('[realtime]', status, err ?? '')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  if (!currentUser) return <Navigate to="/" replace />

  if (loading) return <div className="page-status">Cargando...</div>
  if (error || !lecture) return <div className="page-status">Coloquio no encontrado.</div>

  const { date, time } = formatDate(lecture.datetime)
  const isLive = lecture.status === 'live'
  const isUpcoming = lecture.status === 'upcoming'
  const isPast = lecture.status === 'past'

  return (
    <div className="lecture-page page-transition">
      <Navbar />

      <div
        className="lecture-banner"
        style={{
          backgroundImage: lecture.banner?.startsWith('#') ? 'none' : `url(${lecture.banner})`,
          backgroundColor: lecture.banner?.startsWith('#') ? lecture.banner : '#0A0A0A',
        }}
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
            <span key={i} className="speaker-name">{s.name}</span>
          ))}
        </div>
      </div>

      <hr className="section-separator" />

      <section className="lecture-feed-section">
        <h2 className="feed-heading">LO QUE VES</h2>
        <p className="feed-subline">Lo que otros se llevaron de este coloquio.</p>

        {posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__quote">"</span>
            <p className="empty-state__text">Sé el primero en dejar lo que ves.</p>
          </div>
        ) : (
          <div className="feed-masonry">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {showTooltip && (
        <div className="fab-tooltip">Deja tu aporte</div>
      )}
      <button className="fab" onClick={() => {
        trackEvent('fab_click', {
          lecture_id: id,
          lecture_title: lecture?.title,
        })
        setShowModal(true)
      }} aria-label="Agregar aporte">
        +
      </button>

      {showModal && (
        <AddTakeModal
          onClose={() => setShowModal(false)}
          lectureId={id}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
