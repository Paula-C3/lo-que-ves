import { useState } from 'react'

export default function AddTakeModal({ onClose, onSubmit }) {
  const [tab, setTab] = useState('imagen')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!caption.trim()) return
    onSubmit({
      type: tab === 'imagen' ? 'image' : 'text',
      content_url: tab === 'imagen' && imageUrl.trim() ? imageUrl.trim() : null,
      caption: caption.trim(),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-brand">LO QUE VES</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'imagen' ? 'active' : ''}`}
            onClick={() => setTab('imagen')}
          >
            Imagen
          </button>
          <button
            className={`modal-tab ${tab === 'texto' ? 'active' : ''}`}
            onClick={() => setTab('texto')}
          >
            Texto
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {tab === 'imagen' && (
            <div className="modal-field">
              <label className="modal-label">URL de la imagen</label>
              <input
                type="text"
                className="modal-input"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="modal-preview"
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          )}

          <div className="modal-field">
            {tab === 'texto' && (
              <textarea
                className="modal-textarea modal-textarea-lg"
                placeholder="¿Qué te llevaste de este coloquio?"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                required
              />
            )}
            {tab === 'imagen' && (
              <textarea
                className="modal-textarea"
                placeholder="¿Qué te llevaste?"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                required
              />
            )}
          </div>

          <button type="submit" className="modal-submit">PUBLICAR</button>
        </form>
      </div>
    </div>
  )
}
