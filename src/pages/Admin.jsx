import { useState, useEffect } from 'react'
import { getAllLectures, createLecture, updateLecture, deleteLecture } from '../lib/lecturesService'
import { BANNER_COLORS, randomColor } from '../lib/colors'
import BackToPanel from '../components/BackToPanel'

function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-EC', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function toDateValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().split('T')[0]
}

function toTimeValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toTimeString().split(':').slice(0, 2).join(':')
}

const emptyForm = {
  title: '', banner: '', classroom: '', date: '', time: '',
  description: '', speaker_name: '', speaker_instagram: '',
  speaker_linkedin: '', speaker_twitter: '', status: 'upcoming',
  visible_from: '',
}

export default function Admin() {
  const [lectures, setLectures] = useState([])
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [listError, setListError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  function loadLectures() {
    getAllLectures()
      .then(setLectures)
      .catch(err => setListError(err.message))
  }

  useEffect(() => { loadLectures() }, [])

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function setEdit(field) {
    return e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleBannerUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, banner: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function handleEditBannerUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, banner: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function openEdit(l) {
    if (editingId === l.id) {
      setEditingId(null)
      return
    }
    const speaker = l.speakers?.[0] || {}
    setEditingId(l.id)
    setEditForm({
      title: l.title || '',
      banner: l.banner || '',
      classroom: l.classroom || '',
      date: toDateValue(l.datetime),
      time: toTimeValue(l.datetime),
      description: l.description || '',
      speaker_name: speaker.name || '',
      speaker_instagram: speaker.instagram || '',
      speaker_linkedin: speaker.linkedin || '',
      speaker_twitter: speaker.twitter || '',
      status: l.status || 'upcoming',
      visible_from: toDateValue(l.visible_from),
    })
    setEditSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    if (!form.title || !form.classroom || !form.date || !form.time || !form.description || !form.speaker_name) {
      setSubmitError('Por favor completa los campos obligatorios.')
      return
    }

    const datetime = new Date(`${form.date}T${form.time}`).toISOString()

    const visible_from = form.visible_from
      ? new Date(form.visible_from).toISOString()
      : new Date().toISOString()

    const payload = {
      title: form.title,
      banner: form.banner || randomColor(BANNER_COLORS),
      classroom: form.classroom,
      datetime,
      description: form.description,
      speakers: [{
        name: form.speaker_name,
        instagram: form.speaker_instagram || '#',
        linkedin: form.speaker_linkedin || '#',
        twitter: form.speaker_twitter || '#'
      }],
      status: form.status || 'upcoming',
      visible_from,
    }

    try {
      await createLecture(payload)
      loadLectures()
      setForm({ ...emptyForm })
    } catch (err) {
      setSubmitError(err.message)
    }
  }

  async function handleEditSave(id) {
    setEditSuccess('')
    setListError('')

    const datetime = new Date(`${editForm.date}T${editForm.time}`).toISOString()

    const visible_from = editForm.visible_from
      ? new Date(editForm.visible_from).toISOString()
      : new Date().toISOString()

    const payload = {
      title: editForm.title,
      banner: editForm.banner || randomColor(BANNER_COLORS),
      classroom: editForm.classroom,
      datetime,
      description: editForm.description,
      speakers: [{
        name: editForm.speaker_name,
        instagram: editForm.speaker_instagram || '#',
        linkedin: editForm.speaker_linkedin || '#',
        twitter: editForm.speaker_twitter || '#'
      }],
      status: editForm.status || 'upcoming',
      visible_from,
    }

    try {
      await updateLecture(id, payload)
      loadLectures()
      setEditingId(null)
      setEditSuccess('Cambios guardados.')
    } catch (err) {
      setListError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteLecture(id)
      setLectures(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <span className="admin-brand">ADMIN</span>
        <span className="admin-brand-sub">/ Lo Que Ves</span>
      </header>

      <div style={{ padding: '0 2rem' }}>
        <BackToPanel />
      </div>

      <form className="admin-card" onSubmit={handleSubmit}>
        <h2 className="admin-section-heading">NUEVO COLOQUIO</h2>

        <div className="admin-field">
          <label className="admin-label">Título <span className="admin-required">*</span></label>
          <input className="admin-input" value={form.title} onChange={set('title')} />
        </div>

        <div className="admin-field">
          <label className="admin-label">Banner <span className="admin-optional">(opcional)</span></label>
          <input type="file" accept="image/*" onChange={handleBannerUpload} className="form-input-file" />
          {form.banner && (
            <img src={form.banner} alt="preview" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '2px' }} />
          )}
        </div>

        <div className="admin-field">
          <label className="admin-label">Aula <span className="admin-required">*</span></label>
          <input className="admin-input" value={form.classroom} onChange={set('classroom')} />
        </div>

        <div className="admin-field">
          <label className="admin-label">Fecha y hora <span className="admin-required">*</span></label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="date" className="admin-input" value={form.date} onChange={set('date')} style={{ flex: 1 }} />
            <input type="time" className="admin-input" value={form.time} onChange={set('time')} style={{ flex: 1 }} />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Descripción <span className="admin-required">*</span></label>
          <textarea className="admin-textarea" rows="3" value={form.description} onChange={set('description')} />
        </div>

        <div className="admin-field">
          <label className="admin-label">Nombre del expositor <span className="admin-required">*</span></label>
          <input className="admin-input" value={form.speaker_name} onChange={set('speaker_name')} />
        </div>

        <div className="admin-social-row">
          <div className="admin-field">
            <label className="admin-label">Instagram <span className="admin-optional">(opcional)</span></label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_instagram} onChange={set('speaker_instagram')} />
          </div>
          <div className="admin-field">
            <label className="admin-label">LinkedIn <span className="admin-optional">(opcional)</span></label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_linkedin} onChange={set('speaker_linkedin')} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Twitter <span className="admin-optional">(opcional)</span></label>
            <input className="admin-input" placeholder="URL o #" value={form.speaker_twitter} onChange={set('speaker_twitter')} />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Estado <span className="admin-optional">(opcional)</span></label>
          <select className="admin-input" value={form.status} onChange={set('status')}>
            <option value="upcoming">Próximo</option>
            <option value="live">En vivo</option>
            <option value="past">Archivado</option>
          </select>
        </div>

        <div className="admin-field">
          <label className="admin-label">Visible desde <span className="admin-optional">(opcional)</span></label>
          <input type="datetime-local" className="admin-input" value={form.visible_from} onChange={set('visible_from')} />
          <span className="admin-helper">Si se deja vacío, el coloquio será visible de inmediato para todos los usuarios.</span>
        </div>

        <button type="submit" className="admin-submit">GUARDAR COLOQUIO</button>
        {submitError && <p className="admin-error">{submitError}</p>}
      </form>

      <section className="admin-list-section">
        <h2 className="admin-section-heading">COLOQUIOS REGISTRADOS</h2>
        {listError && <p className="admin-error">{listError}</p>}
        {editSuccess && <p className="admin-success">{editSuccess}</p>}
        <div className="admin-list">
          {lectures.map(l => {
            const visibleFuture = new Date(l.visible_from) > new Date()
            return (
              <div key={l.id} className="admin-row-wrapper">
                <div
                  className={`admin-row${editingId === l.id ? ' is-expanded' : ''}`}
                  onClick={() => openEdit(l)}
                >
                  <div className="admin-row-info">
                    <span className="admin-row-title">{l.title}</span>
                    <span className={`admin-status-badge ${l.status}`}>{l.status}</span>
                    <span className="admin-row-date">
                      {formatDateTime(l.datetime)}
                    </span>
                  </div>
                  <div className="admin-row-actions">
                    <span className="admin-edit-indicator">
                      {editingId === l.id ? '▾ editar' : '▸ editar'}
                    </span>
                    <button className="admin-delete" onClick={e => { e.stopPropagation(); handleDelete(l.id) }}>eliminar</button>
                  </div>
                </div>

                {editingId === l.id && (
                  <div className="admin-row-edit" onClick={e => e.stopPropagation()}>
                    <div className="admin-field">
                      <label className="admin-label">Título <span className="admin-required">*</span></label>
                      <input className="admin-input" value={editForm.title} onChange={setEdit('title')} />
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Banner <span className="admin-optional">(opcional)</span></label>
                      <input type="file" accept="image/*" onChange={handleEditBannerUpload} className="form-input-file" />
                      {editForm.banner && (
                        <img src={editForm.banner} alt="preview" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '2px' }} />
                      )}
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Aula <span className="admin-required">*</span></label>
                      <input className="admin-input" value={editForm.classroom} onChange={setEdit('classroom')} />
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Fecha y hora <span className="admin-required">*</span></label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="date" className="admin-input" value={editForm.date} onChange={setEdit('date')} style={{ flex: 1 }} />
                        <input type="time" className="admin-input" value={editForm.time} onChange={setEdit('time')} style={{ flex: 1 }} />
                      </div>
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Descripción <span className="admin-required">*</span></label>
                      <textarea className="admin-textarea" rows="3" value={editForm.description} onChange={setEdit('description')} />
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Nombre del expositor <span className="admin-required">*</span></label>
                      <input className="admin-input" value={editForm.speaker_name} onChange={setEdit('speaker_name')} />
                    </div>

                    <div className="admin-social-row">
                      <div className="admin-field">
                        <label className="admin-label">Instagram <span className="admin-optional">(opcional)</span></label>
                        <input className="admin-input" placeholder="URL o #" value={editForm.speaker_instagram} onChange={setEdit('speaker_instagram')} />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">LinkedIn <span className="admin-optional">(opcional)</span></label>
                        <input className="admin-input" placeholder="URL o #" value={editForm.speaker_linkedin} onChange={setEdit('speaker_linkedin')} />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">Twitter <span className="admin-optional">(opcional)</span></label>
                        <input className="admin-input" placeholder="URL o #" value={editForm.speaker_twitter} onChange={setEdit('speaker_twitter')} />
                      </div>
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Estado <span className="admin-optional">(opcional)</span></label>
                      <select className="admin-input" value={editForm.status} onChange={setEdit('status')}>
                        <option value="upcoming">Próximo</option>
                        <option value="live">En vivo</option>
                        <option value="past">Archivado</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Visible desde <span className="admin-optional">(opcional)</span></label>
                      <input type="datetime-local" className="admin-input" value={editForm.visible_from} onChange={setEdit('visible_from')} />
                      <span className="admin-helper">Si se deja vacío, el coloquio será visible de inmediato para todos los usuarios.</span>
                    </div>

                    <div className="admin-edit-actions">
                      <button className="admin-save-btn" onClick={() => handleEditSave(l.id)}>GUARDAR</button>
                      <button className="admin-cancel-btn" onClick={() => setEditingId(null)}>CANCELAR</button>
                    </div>
                  </div>
                )}
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
