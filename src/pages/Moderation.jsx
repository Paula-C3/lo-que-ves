import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPosts, deletePost } from '../lib/postsService'
import { getAllLectures } from '../lib/lecturesService'
import '../styles/moderation.css'

export default function Moderation() {
  const navigate = useNavigate()
  const [lectures, setLectures] = useState([])
  const [posts, setPosts] = useState([])
  const [activeLecture, setActiveLecture] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    Promise.all([
      getAllLectures(),
      getAllPosts(),
    ]).then(([l, p]) => {
      setLectures(l)
      setPosts(p)
    })
  }, [])

  const filtered = activeLecture
    ? posts.filter(p => p.lecture_id === activeLecture)
    : posts

  const lectureMap = Object.fromEntries(
    lectures.map(l => [l.id, l.title])
  )

  function handleDelete(postId) {
    setRemoving(postId)
    setTimeout(() => {
      setPosts(prev => prev.filter(p => p.id !== postId))
      setRemoving(null)
      setConfirming(null)
    }, 300)
  }

  return (
    <div className="moderation-page">
      <header className="analytics-header">
        <div className="analytics-header-left">
          <span className="analytics-brand">MODERACIÓN</span>
          <span className="analytics-brand-sub">/ Lo Que Ves</span>
        </div>
        <button className="analytics-back" onClick={() => navigate('/dashboard')}>← PANEL</button>
      </header>

      <div className="moderation-tabs">
        <button
          className={`moderation-tab${activeLecture === null ? ' is-active' : ''}`}
          onClick={() => setActiveLecture(null)}
        >
          TODOS
        </button>
        {lectures.map(l => (
          <button
            key={l.id}
            className={`moderation-tab${activeLecture === l.id ? ' is-active' : ''}`}
            onClick={() => setActiveLecture(l.id)}
          >
            {l.title}
          </button>
        ))}
      </div>

      <div className="moderation-list">
        {filtered.length === 0 ? (
          <div className="moderation-empty">No hay aportes aquí.</div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              className={`moderation-row${removing === p.id ? ' post-row--removing' : ''}`}
            >
              <div className="moderation-row-left">
                {p.type === 'image' ? (
                  <img src={p.content_url} alt="" className="moderation-thumb" />
                ) : (
                  <span className="moderation-quote">"</span>
                )}
              </div>
              <div className="moderation-row-center">
                <p className="moderation-caption">{p.caption}</p>
                <span className="moderation-meta">
                  <span className="moderation-meta-lecture">{lectureMap[p.lecture_id] || 'Desconocido'}</span>
                  <span className="moderation-meta-sep">·</span>
                  <span className="moderation-meta-time">{p.timestamp_label}</span>
                </span>
              </div>
              <div className="moderation-row-right">
                {confirming === p.id ? (
                  <span className="moderation-confirm-box">
                    <span className="moderation-confirm-text">¿seguro?</span>
                    <button className="moderation-confirm-yes" onClick={() => handleDelete(p.id)}>sí</button>
                    <button className="moderation-confirm-no" onClick={() => setConfirming(null)}>no</button>
                  </span>
                ) : (
                  <button
                    className="moderation-delete"
                    onClick={() => setConfirming(p.id)}
                  >
                    eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
