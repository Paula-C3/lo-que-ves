import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getPostsByUser } from '../lib/postsService'
import { getLectures } from '../lib/lecturesService'

const AVATAR_OPTIONS = [1, 5, 11, 14, 22, 33, 44, 47]

function ContributionCard({ post, lectureTitle }) {
  const [hovered, setHovered] = useState(false)

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
  const [lectureMap, setLectureMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      setEditedName(currentUser.name || '')
      setEditedAvatar(currentUser.avatar || AVATAR_OPTIONS[0].toString())
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    Promise.all([
      getPostsByUser(currentUser.id),
      getLectures(),
    ]).then(([userPosts, lectures]) => {
      setPosts(userPosts)
      const map = {}
      lectures.forEach(l => { map[l.id] = l.title })
      setLectureMap(map)
    }).catch(() => {}).finally(() => setLoading(false))
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
    <div className="profile-page">
      <Navbar />

      <div className="profile-header">
        <img
          src={currentUser.avatar}
          alt=""
          className="profile-avatar"
          onError={e => { e.target.src = 'https://i.pravatar.cc/150?img=1' }}
        />
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
            {AVATAR_OPTIONS.map(n => {
              const url = `https://i.pravatar.cc/150?img=${n}`
              const selected = editedAvatar === url
              return (
                <button
                  key={n}
                  type="button"
                  className={`avatar-option ${selected ? 'selected' : ''}`}
                  onClick={() => setEditedAvatar(url)}
                >
                  <img src={url} alt="" />
                </button>
              )
            })}
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
          <p className="profile-contrib-empty">Aún no has dejado ningún aporte.</p>
        ) : (
          <div className="contrib-grid">
            {posts.map(post => (
              <ContributionCard
                key={post.id}
                post={post}
                lectureTitle={lectureMap[post.lecture_id] || ''}
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
