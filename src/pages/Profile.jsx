import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getPostsByUser } from '../lib/postsService'
import { supabase } from '../lib/supabase'
import { AVATAR_COLORS } from '../lib/colors'

function Avatar({ value, size = 120 }) {
  const isColor = value?.startsWith('#')
  return (
    <div
      className="profile-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid var(--color-accent)',
        background: isColor ? value : '#333',
        backgroundImage: isColor ? 'none' : `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
      }}
    />
  )
}

function ContributionCard({ post }) {
  const [hovered, setHovered] = useState(false)
  const lectureTitle = post.lectures?.title || ''

  if (post.type === 'image') {
    return (
      <div
        className="contrib-card contrib-image-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="contrib-image-wrap">
          <img src={post.content_url} alt="" className="contrib-image" />
          {hovered && (
            <div className="contrib-image-overlay">
              <p className="contrib-overlay-caption">{post.caption}</p>
            </div>
          )}
        </div>
        <span className="contrib-lecture-label">{lectureTitle}</span>
      </div>
    )
  }

  return (
    <div className="contrib-card contrib-text-card">
      <div className="contrib-text-content">
        <span className="contrib-text-quote">"</span>
        <p className="contrib-text-caption">{post.caption}</p>
      </div>
      <span className="contrib-lecture-label">{lectureTitle}</span>
    </div>
  )
}

export default function Profile() {
  const { currentUser, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [editedName, setEditedName] = useState('')
  const [editedAvatar, setEditedAvatar] = useState('')
  const [saved, setSaved] = useState(false)
  const [fading, setFading] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      setEditedName(currentUser.name || '')
      setEditedAvatar(currentUser.avatar || AVATAR_COLORS[0])
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    getPostsByUser(currentUser.id)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel('profile-posts-' + currentUser.id)
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  if (!currentUser) return <Navigate to="/" replace />

  function handleSave(e) {
    e.preventDefault()
    updateUser(editedName, editedAvatar)
    setSaved(true)
    setFading(false)
    setTimeout(() => setFading(true), 2000)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="profile-page page-transition">
      <Navbar />

      <div className="profile-header">
        <Avatar value={currentUser.avatar} />
        <h1 className="profile-name">{currentUser.name}</h1>
        <p className="profile-career">{currentUser.career}</p>
        <p className="profile-code">{currentUser.code}</p>
      </div>

      <form className="profile-edit-card" onSubmit={handleSave}>
        <h2 className="profile-section-heading">EDITAR PERFIL</h2>

        <div className="profile-field">
          <label className="profile-label">Nombre</label>
          <input
            type="text"
            className="profile-input"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
          />
        </div>

        <div className="profile-field">
          <label className="profile-label">Avatar</label>
          <div className="avatar-picker">
            {AVATAR_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={`avatar-swatch ${editedAvatar === color ? 'avatar-swatch--selected' : ''}`}
                style={{ background: color }}
                onClick={() => setEditedAvatar(color)}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="profile-save">GUARDAR CAMBIOS</button>
        {saved && (
          <p className={`profile-saved-msg ${fading ? 'fading' : ''}`}>Cambios guardados.</p>
        )}
      </form>

      <section className="profile-contributions">
        <h2 className="profile-section-heading">MIS APORTES</h2>
        <p className="profile-contrib-subline">Todo lo que has dejado en los coloquios.</p>

        {loading ? (
          <p className="page-status">Cargando...</p>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__quote">"</span>
            <p className="empty-state__text">Aún no has dejado ningún aporte.</p>
          </div>
        ) : (
          <div className="contrib-grid">
            {posts.map(post => (
              <ContributionCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        )}
      </section>

      <div className="profile-logout">
        <button className="logout-btn" onClick={handleLogout}>CERRAR SESIÓN</button>
      </div>
    </div>
  )
}
