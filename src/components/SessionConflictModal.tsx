import React from 'react';

interface SessionConflictModalProps {
  mode: 'prompt' | 'suspended';
  accountEmail?: string;
  otherDeviceName?: string;
  darkMode?: boolean;
  onClaimSession: () => void;
  onCancelPrompt?: () => void;
}

export const SessionConflictModal: React.FC<SessionConflictModalProps> = ({
  mode,
  accountEmail,
  otherDeviceName,
  darkMode = false,
  onClaimSession,
  onCancelPrompt
}) => {
  const isPrompt = mode === 'prompt';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(6px)',
      padding: '1rem'
    }}>
      <div style={{
        background: darkMode ? '#18181b' : '#ffffff',
        border: `3px solid ${darkMode ? '#a855f7' : '#000000'}`,
        boxShadow: darkMode 
          ? '0 12px 36px rgba(168, 85, 247, 0.3)' 
          : '0 12px 36px rgba(0, 0, 0, 0.6)',
        maxWidth: '420px',
        width: '100%',
        padding: '1.5rem',
        borderRadius: '4px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        color: darkMode ? '#ffffff' : '#000000',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>
          {isPrompt ? '📱' : '⚠️'}
        </div>

        <div>
          <h2 style={{
            margin: '0 0 0.4rem 0',
            fontSize: '1.2rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            color: isPrompt ? (darkMode ? '#38bdf8' : '#0284c7') : (darkMode ? '#f43f5e' : '#e11d48')
          }}>
            {isPrompt ? 'Account Active Elsewhere' : 'Gameplay Continued Elsewhere'}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.4,
            opacity: 0.9,
            fontWeight: '500'
          }}>
            {isPrompt ? (
              <>
                Account {accountEmail ? <strong>({accountEmail})</strong> : ''} is currently active on <strong>{otherDeviceName || 'another device'}</strong>.
                <br /><br />
                Would you like to continue playing on this device?
              </>
            ) : (
              <>
                Gameplay for account {accountEmail ? <strong>({accountEmail})</strong> : ''} has continued on another device (<strong>{otherDeviceName || 'Mobile/Desktop'}</strong>).
                <br /><br />
                Active play on this screen has been paused so progress stays in sync.
              </>
            )}
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          marginTop: '0.4rem'
        }}>
          <button
            onClick={onClaimSession}
            className="game-btn"
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 'black',
              textTransform: 'uppercase',
              background: 'var(--neon-cyan, #06b6d4)',
              color: '#000000',
              border: `2px solid ${darkMode ? '#ffffff' : '#000000'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            {isPrompt ? '▶️ Continue on This Device' : '🔄 Continue Here'}
          </button>

          {isPrompt && onCancelPrompt && (
            <button
              onClick={onCancelPrompt}
              className="game-btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                background: darkMode ? '#3f3f46' : '#e4e4e7',
                color: darkMode ? '#ffffff' : '#000000',
                border: `1px solid ${darkMode ? '#71717a' : '#000000'}`,
                cursor: 'pointer'
              }}
            >
              Cancel / Play Offline
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
