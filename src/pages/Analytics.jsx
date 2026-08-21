import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackToPanel from '../components/BackToPanel'
import { getTotalUsers, getPostsPerLecture, getLectureTitles, getAnswersAnalytics } from '../lib/analyticsService'

export default function Analytics() {
  const navigate = useNavigate()
  const [totalUsers, setTotalUsers] = useState(0)
  const [lectureData, setLectureData] = useState([])
  const [totalContributions, setTotalContributions] = useState(0)
  const [answers, setAnswers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      getTotalUsers(),
      getPostsPerLecture(),
      getLectureTitles(),
    ])
      .then(([users, counts, titles]) => {
        setTotalUsers(users)
        const all = Object.values(counts).reduce((s, v) => s + v, 0)
        setTotalContributions(all)
        const max = Math.max(...Object.values(counts), 1)
        const data = titles.map(t => ({
          ...t,
          count: counts[t.id] || 0,
          pct: ((counts[t.id] || 0) / max) * 100,
        }))
        setLectureData(data)
        setLoading(false)
        setTimeout(() => setReady(true), 50)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    getAnswersAnalytics().then(setAnswers).catch(err => setError(err.message))
  }, [])

  if (loading) return <div className="analytics-page"><div className="page-status">Cargando métricas...</div></div>
  if (error) return <div className="analytics-page"><div className="page-status" style={{ color: '#FFD400' }}>{error}</div></div>

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="analytics-header-left">
          <span className="analytics-brand">ANALYTICS</span>
          <span className="analytics-brand-sub">/ Lo Que Ves</span>
        </div>
        <button className="analytics-back" onClick={() => navigate('/home')}>← VOLVER</button>
      </header>

      <div style={{ padding: '0 2rem' }}>
        <BackToPanel />
      </div>

      <div className="analytics-kpi-row">
        <div className="analytics-card">
          <span className="analytics-card-label">TOTAL LOGINS</span>
          <span className="analytics-card-number analytics-number-yellow">{totalUsers}</span>
          <span className="analytics-card-sub">usuarios registrados</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card-label">CONTRIBUCIONES</span>
          <span className="analytics-card-number">{totalContributions}</span>
          <span className="analytics-card-sub analytics-sub-yellow">aportes en todos los coloquios</span>
        </div>
      </div>

      <section className="analytics-chart-section">
        <h2 className="analytics-section-heading">APORTES POR COLOQUIO</h2>
        <div className="analytics-chart">
          {lectureData.map(l => (
            <div key={l.id} className="analytics-bar-row">
              <span className="analytics-bar-label">{l.title}</span>
              <div className="analytics-bar-track">
                <div
                  className={`analytics-bar-fill ${l.count === 0 ? 'empty' : ''}`}
                  style={{ width: ready ? `${Math.max(l.pct, 4)}%` : '0%' }}
                />
              </div>
              <span className="analytics-bar-count">{l.count}</span>
            </div>
          ))}
        </div>
      </section>

      {answers && (
        <div className="analytics-answers">
          <h2 className="analytics-section-heading">RESPUESTAS</h2>

          {/* Q2 — select breakdown */}
          <div className="analytics-card">
            <p className="analytics-card__label">¿Cómo calificarías el contenido del coloquio?</p>
            <div className="analytics-bars">
              {Object.entries({
                'Muy relevante': answers.q2Counts.muy_relevante,
                'Relevante': answers.q2Counts.relevante,
                'Algo relevante': answers.q2Counts.algo_relevante,
                'Poco relevante': answers.q2Counts.poco_relevante
              }).map(([label, count]) => {
                const max = Math.max(...Object.values(answers.q2Counts))
                return (
                  <div key={label} className="analytics-bar-row">
                    <span className="analytics-bar-row__label">{label}</span>
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{ width: max ? `${(count / max) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="analytics-bar-row__count">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Q3 — scale breakdown */}
          <div className="analytics-card">
            <p className="analytics-card__label">¿Qué tan probable es que recomiendes este coloquio? (1–5)</p>
            <div className="analytics-scale-row">
              {['1','2','3','4','5'].map(n => {
                const max = Math.max(...Object.values(answers.q3Counts))
                const count = answers.q3Counts[n]
                return (
                  <div key={n} className="analytics-scale-col">
                    <span className="analytics-scale-col__count">{count}</span>
                    <div
                      className="analytics-scale-col__bar"
                      style={{ height: max ? `${(count / max) * 80 + 8}px` : '8px' }}
                    />
                    <span className="analytics-scale-col__label">{n}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Q1 — text answers list */}
          <div className="analytics-card">
            <p className="analytics-card__label">¿Qué fue lo más relevante para ti? ({answers.q1Answers.length} respuestas)</p>
            <div className="analytics-q1-list">
              {answers.q1Answers.slice(0, 20).map((ans, i) => (
                <div key={i} className="analytics-q1-item">
                  <span className="analytics-q1-item__quote">"</span>
                  <span className="analytics-q1-item__text">{ans}</span>
                </div>
              ))}
              {answers.q1Answers.length > 20 && (
                <p className="analytics-q1-more">y {answers.q1Answers.length - 20} respuestas más...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
