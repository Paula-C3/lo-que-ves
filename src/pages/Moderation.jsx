import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackToPanel from '../components/BackToPanel'
import { getAllPosts, deletePost } from '../lib/postsService'
import { getAllLectures } from '../lib/lecturesService'
import '../styles/moderation.css'

export default function Moderation() {
  const navigate = useNavigate()
  const [lectures, setLectures] = useState([])
  const [posts, setPosts] = useState([])
  const [selectedLecture, setSelectedLecture] = useState('all')
  const [confirming, setConfirming] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    Promise.all([
      getAllLectures(),
      getAllPosts(),
    ]).then(([l, p]) => {
      setLectures(l)
      setPosts(p)
    })
  }, [])

  const filtered = selectedLecture === 'all'
    ? posts
    : posts.filter(p => p.lecture_id === selectedLecture)

  async function handleConfirmDelete(postId) {
    const row = document.getElementById(`post-row-${postId}`)
    if (row) row.classList.add('post-row--removing')

    setTimeout(async () => {
      try {
        await deletePost(postId)
        setPosts(prev => prev.filter(p => p.id !== postId))
        setConfirming(null)
      } catch (err) {
        setDeleteError('Error al eliminar: ' + err.message)
        if (row) row.classList.remove('post-row--removing')
      }
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

      <div style={{ padding: '0 2rem' }}>
        <BackToPanel />
      </div>

      <div className="moderation-filter">
        <label className="moderation-filter__label">FILTRAR POR COLOQUIO</label>
        <select
          className="moderation-filter__select"
          value={selectedLecture}
          onChange={e => setSelectedLecture(e.target.value)}
        >
          <option value="all">Todos los coloquios</option>
          {lectures.map(l => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      <div className="moderation-list">
        {deleteError && <p className="admin-error">{deleteError}</p>}
        {filtered.length === 0 ? (
          <div className="moderation-empty">No hay aportes aquí.</div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              id={`post-row-${p.id}`}
              className="moderation-row"
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
                  <span className="moderation-meta-lecture">{p.lectures?.title || 'Desconocido'}</span>
                  <span className="moderation-meta-sep">·</span>
                  <span className="moderation-meta-time">{p.timestamp_label}</span>
                </span>
              </div>
              <div className="moderation-row-right">
                {confirming === p.id ? (
                  <span className="moderation-confirm-box">
                    <span className="moderation-confirm-text">¿seguro?</span>
                    <button className="moderation-confirm-yes" onClick={() => handleConfirmDelete(p.id)}>sí</button>
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
