import { useState } from 'react'

export default function AddTakeModal({ onClose, onSubmit }) {
  const [tab, setTab] = useState('imagen')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' })

  const answersComplete =
    answers.q1.trim() !== '' && answers.q2 !== '' && answers.q3 !== ''

  function handleSubmit(e) {
    e.preventDefault()
    if (!caption.trim() || !answersComplete) return
    onSubmit({
      type: tab === 'imagen' ? 'image' : 'text',
      content_url: tab === 'imagen' && imageUrl.trim() ? imageUrl.trim() : null,
      caption: caption.trim(),
      answers: {
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
      },
    })
    setAnswers({ q1: '', q2: '', q3: '' })
    onClose()
  }

  function handleOverlayClick() {
    setAnswers({ q1: '', q2: '', q3: '' })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-brand">LO QUE VES</span>
          <button className="modal-close" onClick={() => {
            setAnswers({ q1: '', q2: '', q3: '' })
            onClose()
          }}>×</button>
        </div>

        <div className="modal-questions">
          <p className="modal-questions__heading">Antes de continuar, responde estas preguntas:</p>

          <div className="modal-question">
            <label className="modal-question__label">
              Pregunta 1 <span className="modal-question__required">*</span>
            </label>
            <p className="modal-question__hint">¿Qué fue lo más relevante para ti?</p>
            <input
              type="text"
              className="form-input"
              placeholder="Escribe tu respuesta..."
              value={answers.q1}
              onChange={e => setAnswers(prev => ({ ...prev, q1: e.target.value }))}
            />
          </div>

          <div className="modal-question">
            <label className="modal-question__label">
              Pregunta 2 <span className="modal-question__required">*</span>
            </label>
            <p className="modal-question__hint">¿Cómo calificarías el contenido del coloquio?</p>
            <select
              className="form-input"
              value={answers.q2}
              onChange={e => setAnswers(prev => ({ ...prev, q2: e.target.value }))}
            >
              <option value="">Selecciona una opción</option>
              <option value="muy_relevante">Muy relevante</option>
              <option value="relevante">Relevante</option>
              <option value="algo_relevante">Algo relevante</option>
              <option value="poco_relevante">Poco relevante</option>
            </select>
          </div>

          <div className="modal-question">
            <label className="modal-question__label">
              Pregunta 3 <span className="modal-question__required">*</span>
            </label>
            <p className="modal-question__hint">¿Qué tan probable es que recomiendes este coloquio? (1–5)</p>
            <div className="modal-scale">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`modal-scale__btn ${answers.q3 === String(n) ? 'modal-scale__btn--selected' : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, q3: String(n) }))}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="modal-scale__labels">
              <span>Poco probable</span>
              <span>Muy probable</span>
            </div>
          </div>
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

          <button
            type="submit"
            className="modal-submit"
            disabled={!answersComplete}
            style={{ opacity: answersComplete ? 1 : 0.4, cursor: answersComplete ? 'pointer' : 'not-allowed' }}
          >
            PUBLICAR
          </button>
        </form>
      </div>
    </div>
  )
}
