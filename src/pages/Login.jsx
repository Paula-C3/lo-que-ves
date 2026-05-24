import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CAREERS = [
  'Ingeniería en Sistemas',
  'Ingeniería Civil',
  'Ingeniería Mecánica',
  'Ingeniería Eléctrica',
  'Ingeniería Industrial',
  'Ingeniería Ambiental',
  'Arquitectura',
]

const CODE_REGEX = /^003\d{5}$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [career, setCareer] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!CODE_REGEX.test(code)) {
      setError('Código inválido — debe tener formato 003XXXXX')
      return
    }
    try {
      setLoading(true)
      await login(code, career)
      navigate('/home')
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Lo Que Ves</h1>
          <p className="login-subtitle">En cada coloquio hay algo que te sirve.</p>

          <div className="login-field">
            <label htmlFor="career">Carrera</label>
            <select
              id="career"
              value={career}
              onChange={e => setCareer(e.target.value)}
              required
            >
              <option value="" disabled>Selecciona tu carrera</option>
              {CAREERS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="login-field">
            <label htmlFor="code">Código de estudiante</label>
            <input
              id="code"
              type="text"
              placeholder="003XXXXX"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            {error && <span className="login-error">{error}</span>}
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>

      <div className="login-hero">
        <div className="login-hero-text">
          <span>LO</span>
          <span>QUE</span>
          <span>VES</span>
        </div>
        <p className="login-hero-sub">En cada coloquio hay algo que te sirve.</p>
      </div>
    </div>
  )
}
