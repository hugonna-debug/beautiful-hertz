import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MIN-MAXXED React ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear local storage if corrupt state caused render crash
      localStorage.removeItem('MIN_MAXXED_SAVE');
      localStorage.removeItem('min_maxxed_save_v1');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080313',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#181028',
            border: '3px solid #ff007c',
            boxShadow: '0 0 30px rgba(255, 0, 124, 0.4)',
            maxWidth: '500px',
            padding: '2rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h2 style={{ color: '#00f0ff', margin: '0 0 0.8rem 0', fontSize: '1.4rem', textTransform: 'uppercase' }}>
              MIN-MAXXED Recovery Core
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              An unexpected render error occurred. Click below to auto-recover and reload without losing cloud sync.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.8rem 1.6rem',
                fontSize: '0.9rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                background: '#ffe600',
                color: '#000000',
                border: '2px solid #000000',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh & Auto-Recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
