import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../lib/analytics'

const CAREERS = [
  'Tecnología en Informática y Programación',
  'Matemática',
  'Ingeniería Química',
  'Ingeniería Mecánica',
  'Ingeniería Industrial',
  'Ingeniería en Matemáticas Aplicadas y Computación (MAC)',
  'Ingeniería en Electrónica y Automatización',
  'Ingeniería en Ciencias de la Computación',
  'Ingeniería en Alimentos',
  'Ingeniería en Agronomía',
  'Ingeniería en Agroempresa',
  'Ingeniería Civil',
  'Ingeniería Ambiental',
  'Física',
  'Administrador',
]

const ADMIN_CODES = ['00325284', '00092037']
const CODE_REGEX = /^003\d{5}$/

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [career, setCareer] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!career) {
      setError('Por favor selecciona tu carrera.')
      return
    }
    const isValidCode = ADMIN_CODES.includes(code) || CODE_REGEX.test(code)
    if (!isValidCode) {
      setError('Código inválido. Formato: 003XXXXX')
      return
    }

    try {
      setLoading(true)

      if (mode === 'login') {
        const result = await login(code, career)
        if (result.status === 'admin') {
          trackEvent('login', { career, type: 'login' })
          navigate('/dashboard')
        } else if (result.status === 'ok') {
          trackEvent('login', { career, type: 'login' })
          if (ADMIN_CODES.includes(code)) {
            navigate('/dashboard')
          } else {
            navigate('/home')
          }
        } else if (result.status === 'not_found') {
          setError('Código no registrado. ¿Es tu primera vez? Regístrate.')
        } else if (result.status === 'mismatch') {
          setError('Los datos no coinciden con los registrados.')
        }
      } else {
        const result = await register(code, career)
        if (result.status === 'ok') {
          trackEvent('login', { career, type: 'register' })
          navigate('/home')
        } else if (result.status === 'already_exists') {
          setError('Este código ya está registrado. Inicia sesión.')
        }
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page page-transition">
      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Lo Que Ves</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </p>

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
            {loading ? 'Ingresando...' : mode === 'login' ? 'INGRESAR' : 'REGISTRARSE'}
          </button>

          <p className="login-toggle">
            {mode === 'login' ? (
              <>
                ¿Primera vez?{' '}
                <button type="button" className="login-toggle-link" onClick={() => setMode('register')}>
                  Regístrate aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" className="login-toggle-link" onClick={() => setMode('login')}>
                  Inicia sesión
                </button>
              </>
            )}
          </p>
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
