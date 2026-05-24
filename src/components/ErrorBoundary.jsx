import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#0A0A0A',
          color: '#FFD400',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Anton, sans-serif',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>LO QUE VES</div>
          <div style={{ color: '#FFFFFF', fontFamily: 'system-ui', fontSize: '14px', maxWidth: '480px' }}>
            Error al cargar la aplicación. Revisa la consola del navegador.
          </div>
          <div style={{ color: '#666666', fontFamily: 'monospace', fontSize: '12px', marginTop: '16px' }}>
            {this.state.message}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
