import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App.jsx'
import './styles/globals.css'
import './styles/login.css'
import './styles/home.css'
import './styles/lecture.css'
import './styles/profile.css'
import './styles/admin.css'
import './styles/analytics.css'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>,
)
