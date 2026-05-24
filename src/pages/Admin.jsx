import { useState, useEffect } from 'react'
import { getAllLectures, createLecture, deleteLecture } from '../lib/lecturesService'

function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-EC', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const emptyForm = {
  id: '', title: '', banner: '', classroom: '', datetime: '',
  description: '', speaker_name: '', speaker_instagram: '',
  speaker_linkedin: '', speaker_twitter: '', status: 'upcoming',
  visible_from: '',
}

export default function Admin() {
  const [lectures, setLectures] = useState([])
  const [form, setForm] = useState({ ...emptyForm })
  const [submitError, setSubmitError] = useState('')
  const [listError, setListError] = useState('')

  function loadLectures() {
    getAllLectures()
      .then(setLectures)
      .catch(err => setListError(err.message))
  }

  useEffect(() => { loadLectures() }, [])

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const lecture = {
      id: form.id,
      title: form.title,
      banner: form.banner,
      classroom: form.classroom,
      datetime: form.datetime ? new Date(form.datetime).toISOString() : null,
      description: form.description,
      speakers: JSON.stringify([{
        name: form.speaker_name,
        instagram: form.speaker_instagram || '#',
        linkedin: form.speaker_linkedin || '#',
        twitter: form.speaker_twitter || '#',
      }]),
      status: form.status,
      visible_from: form.visible_from ? new Date(form.visible_from).toISOString() : null,
    }

    try {
      await createLecture(lecture)
      loadLectures()
      setForm({ ...emptyForm })
    } catch (err) {
      setSubmitError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteLecture(id)
      loadLectures()
    } catch (err) {
      setListError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <span className="admin-brand">ADMIN</span>
        <span className="admin-brand-sub">/ Lo Que Ves</span>
      </header>

      <form className="admin-card" onSubmit={handleSubmit}>
        <h2 className="admin-section-heading">NUEVO COLOQUIO</h2>

        <div className="admin-field">
          <label className="admin-label">ID único</label>
          <input className="admin-input" placeholder="l5" value={form.id} onChange={set('id')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">Título</label>
          <input className="admin-input" value={form.title} onChange={set('title')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">URL del banner</label>
          <input className="admin-input" value={form.banner} onChange={set('banner')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">Aula</label>
          <input className="admin-input" value={form.classroom} onChange={set('classroom')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">Fecha y hora</label>
          <input type="datetime-local" className="admin-input" value={form.datetime} onChange={set('datetime')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">Descripción</label>
          <textarea className="admin-textarea" rows="3" value={form.description} onChange={set('description')} required />
        </div>

        <div className="admin-field">
          <label className="admin-label">Nombre del expositor</label>
          <input className="admin-input" value={form.speaker_name} onChange={set('speaker_name')} required />
        </div>

        <div className="admin-social-row">
          <div className="admin-field">
            <label className="admin-label">Instagram</label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_instagram} onChange={set('speaker_instagram')} />
          </div>
          <div className="admin-field">
            <label className="admin-label">LinkedIn</label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_linkedin} onChange={set('speaker_linkedin')} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Twitter</label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_twitter} onChange={set('speaker_twitter')} />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Estado</label>
          <select className="admin-input" value={form.status} onChange={set('status')}>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label">Visible desde</label>
          <input type="datetime-local" className="admin-input" value={form.visible_from} onChange={set('visible_from')} required />
          <span className="admin-helper">La charla solo aparecerá para los estudiantes a partir de esta fecha y hora.</span>
        </div>

        <button type="submit" className="admin-submit">GUARDAR COLOQUIO</button>
        {submitError && <p className="admin-error">{submitError}</p>}
      </form>

      <section className="admin-list-section">
        <h2 className="admin-section-heading">COLOQUIOS REGISTRADOS</h2>
        {listError && <p className="admin-error">{listError}</p>}
        <div className="admin-list">
          {lectures.map(l => {
            const visibleFuture = new Date(l.visible_from) > new Date()
            return (
              <div key={l.id} className="admin-row">
                <div className="admin-row-info">
                  <span className="admin-row-title">{l.title}</span>
                  <span className={`admin-status-badge ${l.status}`}>{l.status}</span>
                  <span className="admin-row-date">
                    {visibleFuture && <span className="admin-clock">⏰</span>}
                    {formatDateTime(l.visible_from)}
                  </span>
                </div>
                <button className="admin-delete" onClick={() => handleDelete(l.id)}>eliminar</button>
              </div>
            )
          })}
          {lectures.length === 0 && !listError && (
            <p className="admin-empty">No hay coloquios registrados.</p>
          )}
        </div>
      </section>
    </div>
  )
}
