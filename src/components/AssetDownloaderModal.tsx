import React, { useState, useEffect } from 'react';
import { preloadAllGameAssets, PreloadProgress } from '../utils/assetPreloader';
import { CrystalIcon } from './Icons';

interface AssetDownloaderModalProps {
  darkMode?: boolean;
}

export const AssetDownloaderModal: React.FC<AssetDownloaderModalProps> = ({ darkMode = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<PreloadProgress | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const isDownloaded = localStorage.getItem('min_max_assets_downloaded');
    if (!isDownloaded) {
      setIsOpen(true);
    }
  }, []);

  const startDownload = async () => {
    setIsDownloading(true);
    setProgress({ total: 100, loaded: 0, failed: 0, percent: 0, currentAsset: 'Initializing...', isComplete: false });

    await preloadAllGameAssets(p => {
      setProgress(p);
      if (p.isComplete) {
        setIsDownloading(false);
        setCompleted(true);
        localStorage.setItem('min_max_assets_downloaded', 'true');
        setTimeout(() => {
          setIsOpen(false);
        }, 1200);
      }
    });
  };

  const handleSkip = () => {
    localStorage.setItem('min_max_assets_downloaded', 'skipped');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
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
          width: '460px',
          maxWidth: '92vw',
          background: darkMode ? '#09090b' : '#ffffff',
          border: '4px solid var(--neon-cyan)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          color: darkMode ? '#ffffff' : '#000000'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '3px solid var(--neon-cyan)', paddingBottom: '0.6rem' }}>
          <CrystalIcon size={24} color="var(--neon-cyan)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--neon-cyan)' }}>
            Initial Asset Downloader
          </h2>
        </div>

        <p style={{ fontSize: '0.78rem', lineHeight: '1.4', margin: 0, color: darkMode ? '#d4d4d8' : '#3f3f46' }}>
          Welcome to <strong>MIN-MAXXED</strong>! To ensure smooth 60 FPS combat rendering without white screens or missing sprites, download and pre-cache all game assets to your local device.
        </p>

        {progress && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 'bold' }}>
              <span>{completed ? '✅ Download Complete!' : '📥 Downloading Assets...'}</span>
              <span>{progress.percent}%</span>
            </div>
            {/* Progress Bar Container */}
            <div style={{ width: '100%', height: '16px', background: '#27272a', border: '2px solid #000', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: '100%',
                  background: completed ? '#22c55e' : 'linear-gradient(90deg, var(--neon-cyan) 0%, var(--neon-pink) 100%)',
                  transition: 'width 0.15s ease-out'
                }}
              />
            </div>
            <div style={{ fontSize: '0.62rem', color: '#a1a1aa', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {progress.loaded} / {progress.total} files loaded | {progress.currentAsset}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {!isDownloading && !completed && (
            <>
              <button
                onClick={handleSkip}
                className="game-btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#3f3f46', color: '#ffffff', border: '2px solid #000' }}
              >
                Skip For Now
              </button>
              <button
                onClick={startDownload}
                className="game-btn"
                style={{
                  padding: '0.5rem 1.2rem',
                  fontSize: '0.78rem',
                  fontWeight: 'black',
                  background: 'var(--neon-yellow)',
                  color: '#000000',
                  border: '2px solid #000',
                  boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)'
                }}
              >
                📥 Download All Game Assets
              </button>
            </>
          )}

          {completed && (
            <button
              onClick={() => setIsOpen(false)}
              className="game-btn"
              style={{
                padding: '0.5rem 1.4rem',
                fontSize: '0.8rem',
                fontWeight: 'black',
                background: '#22c55e',
                color: '#ffffff',
                border: '2px solid #000'
              }}
            >
              🚀 Launch Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
