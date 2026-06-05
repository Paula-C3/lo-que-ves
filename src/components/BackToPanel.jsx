import { useNavigate } from 'react-router-dom'

export default function BackToPanel() {
  const navigate = useNavigate()

  return (
    <button className="back-to-panel" onClick={() => navigate('/dashboard')}>
      ← PANEL
    </button>
  )
}
