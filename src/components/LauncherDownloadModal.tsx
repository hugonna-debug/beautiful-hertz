import React, { useState } from 'react';
import { GameLogoIcon } from './Icons';

interface LauncherDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const LauncherDownloadModal: React.FC<LauncherDownloadModalProps> = ({
  isOpen,
  onClose,
  darkMode = true
}) => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDesktopDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/downloads/MIN-MAXXED-Standalone-Launcher.zip';
    link.download = 'MIN-MAXXED-Standalone-Launcher.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePwaInstall = () => {
    if ('serviceWorker' in navigator && (window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
    } else {
      alert('Mobile & Desktop PWA: Tap "Add to Home Screen" or Install Icon in your browser address bar to install standalone app with 100% offline assets!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="terminal-panel"
        style={{
          width: '500px',
          maxWidth: '92vw',
          background: darkMode ? '#09090b' : '#ffffff',
          border: '4px solid var(--neon-cyan)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          color: darkMode ? '#ffffff' : '#000000'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--neon-cyan)', paddingBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GameLogoIcon size={24} color="var(--neon-cyan)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--neon-cyan)' }}>
              Download Standalone Launcher
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: darkMode ? '#fff' : '#000', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.4', color: darkMode ? '#d4d4d8' : '#3f3f46' }}>
          Run <strong>MIN-MAXXED</strong> natively on Desktop or Mobile with 100% pre-cached offline assets, zero browser chrome, and max performance!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* Desktop Launcher Option */}
          <div style={{ background: darkMode ? '#18181b' : '#f4f4f5', border: '2px solid #000', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'black', fontSize: '0.85rem' }}>💻 PC Standalone Desktop Launcher (.bat / Electron)</div>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Includes all 6,679 verified weapons & 1,600+ enemies</div>
            </div>
            <button
              onClick={handleDesktopDownload}
              className="game-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 'bold', background: 'var(--neon-yellow)', color: '#000', border: '2px solid #000' }}
            >
              📥 Download (.bat)
            </button>
          </div>

          {/* Mobile / PWA App Option */}
          <div style={{ background: darkMode ? '#18181b' : '#f4f4f5', border: '2px solid #000', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'black', fontSize: '0.85rem' }}>📱 Mobile PWA / iOS / Android App</div>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Installs directly to home screen with offline sprite cache</div>
            </div>
            <button
              onClick={handlePwaInstall}
              className="game-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 'bold', background: 'var(--neon-pink)', color: '#fff', border: '2px solid #000' }}
            >
              📲 Install App
            </button>
          </div>
        </div>

        {downloadStarted && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', padding: '0.6rem', fontSize: '0.72rem', color: '#22c55e', fontWeight: 'bold' }}>
            ✅ Launcher downloaded! Run the launcher file to start MIN-MAXXED natively anytime.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="game-btn"
            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: '#3f3f46', color: '#fff', border: '2px solid #000' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
