import { useState } from 'react'
import { createPost } from '../lib/postsService'
import { trackEvent } from '../lib/analytics'

const inputStyle = {
  background: '#0A0A0A',
  border: '1px solid #333333',
  color: '#FFFFFF',
  fontFamily: 'inherit',
  fontSize: '14px',
  padding: '10px 14px',
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '2px',
}

export default function AddTakeModal({ onClose, lectureId, currentUser }) {
  const [caption, setCaption] = useState('')
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const answersComplete =
    answers.q1.trim() !== '' && answers.q2 !== '' && answers.q3 !== ''

  function resetForm() {
    setAnswers({ q1: '', q2: '', q3: '' })
    setCaption('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!caption.trim() || !answersComplete || submitting) return

    try {
      setSubmitting(true)
      await createPost({
        lecture_id: lectureId,
        user_id: currentUser.id,
        type: 'text',
        caption: caption.trim(),
        timestamp_label: 'ahora mismo',
        answers: { q1: answers.q1, q2: answers.q2, q3: answers.q3 },
      })
      trackEvent('contribution_submitted', {
        lecture_id: lectureId,
        type: 'text',
      })
      resetForm()
      onClose()
    } catch (err) {
      setError('Error al publicar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOverlayClick() {
    resetForm()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-brand">LO QUE VES</span>
          <button className="modal-close" onClick={() => {
            resetForm()
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
              placeholder="Escribe tu respuesta..."
              value={answers.q1}
              style={inputStyle}
              onChange={e => setAnswers(prev => ({ ...prev, q1: e.target.value }))}
            />
          </div>

          <div className="modal-question">
            <label className="modal-question__label">
              Pregunta 2 <span className="modal-question__required">*</span>
            </label>
            <p className="modal-question__hint">¿Cómo calificarías el contenido del coloquio?</p>
            <select
              value={answers.q2}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
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

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <textarea
              className="modal-textarea modal-textarea-lg"
              placeholder="¿Qué te llevaste de este coloquio?"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="modal-submit"
            disabled={!answersComplete || submitting}
            style={{ opacity: !answersComplete || submitting ? 0.4 : 1, cursor: !answersComplete || submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'PUBLICANDO...' : 'PUBLICAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
