import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { CrystalIcon } from './Icons';
import { safeJsonFetch } from '../utils/safeFetch';

interface AuthManagerProps {
  state: GameState;
  onLoginSuccess: (user: { email: string; name: string; username: string; token: string }) => void;
  onLogout: () => void;
}

export const AuthManager: React.FC<AuthManagerProps> = ({
  state,
  onLoginSuccess,
  onLogout
}) => {
  const [user, setUser] = useState<{ email: string; name: string; username: string; token: string } | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [showMockPanel, setShowMockPanel] = useState(false);

  // Check local storage for existing session
  useEffect(() => {
    const savedSession = localStorage.getItem('min_maxxed_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
        onLoginSuccess(parsed);
      } catch (e) {
        localStorage.removeItem('min_maxxed_session');
      }
    }
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    const google = (window as any).google;
    if (google && google.accounts && google.accounts.id) {
      if (!(window as any).__google_gsi_initialized) {
        (window as any).__google_gsi_initialized = true;
        google.accounts.id.initialize({
          client_id: (import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-id'),
          callback: handleGoogleCallback,
          auto_select: false
        });
      }
      const btnContainer = document.getElementById('google-signin-btn');
      if (btnContainer) {
        btnContainer.innerHTML = '';
        google.accounts.id.renderButton(
          btnContainer,
          { theme: state.darkMode ? 'filled_black' : 'outline', size: 'medium', shape: 'pill' }
        );
      }
    }
  }, [state.darkMode]);

  const handleGoogleCallback = async (response: any) => {
    try {
      const { ok, data, error } = await safeJsonFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });

      if (!ok || !data) {
        throw new Error(error || data?.message || 'Google Auth verification failed');
      }
      
      const sessionData = {
        email: data.email,
        name: data.name,
        username: data.username || '',
        token: response.credential
      };

      if (!data.username) {
        // Must prompt to create custom username!
        setUser(sessionData);
        setShowUsernameModal(true);
      } else {
        completeLogin(sessionData);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth failed');
    }
  };

  const handleMockLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = mockEmail.trim() || 'developer@mminmax.local';
    const cleanUsername = email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'devhero';
    
    const sessionData = {
      email,
      name: 'Developer Mode',
      username: cleanUsername.length >= 3 ? cleanUsername : 'devhero',
      token: 'dev-local-token-' + Date.now()
    };

    completeLogin(sessionData);
    setShowMockPanel(false);
  };

  const handleInstantDevBypass = () => {
    const sessionData = {
      email: 'developer@mminmax.local',
      name: 'Dev Hero',
      username: 'devhero',
      token: 'dev-instant-token-' + Date.now()
    };
    completeLogin(sessionData);
  };

  const submitUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = tempUsername.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 15) {
      setErrorMsg('Username must be between 3 and 15 characters');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      setErrorMsg('Only alphanumeric, underscores or hyphens allowed');
      return;
    }

    try {
      const { ok, data, error } = await safeJsonFetch('/api/user/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ email: user?.email, username: cleanUsername })
      });

      if (!ok || !data) {
        throw new Error(error || data?.message || 'Username registration failed');
      }

      if (user) {
        const updated = { ...user, username: cleanUsername };
        completeLogin(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save username');
    }
  };

  const completeLogin = (sessionData: typeof user) => {
    if (!sessionData) return;
    setUser(sessionData);
    localStorage.setItem('min_maxxed_session', JSON.stringify(sessionData));
    setShowUsernameModal(false);
    setErrorMsg('');
    onLoginSuccess(sessionData);
  };

  const handleLogoutClick = () => {
    setUser(null);
    localStorage.removeItem('min_maxxed_session');
    onLogout();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {errorMsg && (
        <div style={{ fontSize: '0.6rem', color: 'red', border: '1px solid red', padding: '2px 6px', background: '#fee2e2' }}>
          {errorMsg}
        </div>
      )}

      {user && user.username ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(6, 182, 212, 0.1)', border: '2px solid #000', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 'black', color: state.darkMode ? 'var(--neon-cyan)' : '#0f766e', textTransform: 'uppercase' }}>
            👤 {user.username}
          </span>
          <button
            onClick={handleLogoutClick}
            className="game-btn"
            style={{ padding: '1px 5px', fontSize: '0.55rem', border: '1px solid #000', background: '#ef4444', color: '#fff' }}
          >
            Exit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Main Google sign in button wrapper */}
          <div id="google-signin-btn"></div>
          
          {/* Fallback mock login option for local/offline developer convenience */}
          <button
            onClick={handleInstantDevBypass}
            className="game-btn"
            title="1-Click Instant Developer Login"
            style={{ padding: '4px 8px', fontSize: '0.65rem', fontWeight: 'bold', border: '2px solid #000', background: 'var(--neon-yellow)', color: '#000', cursor: 'pointer' }}
          >
            ⚡ DEV Login
          </button>
        </div>
      )}

      {/* MOCK LOGIN PANEL POPUP */}
      {showMockPanel && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="terminal-panel" style={{ width: '300px', background: '#fff', border: '4px solid #000', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', borderBottom: '2px solid #000', paddingBottom: '0.4rem', textTransform: 'uppercase' }}>
              Developer Login Bypass
            </h3>
            <p style={{ fontSize: '0.65rem', color: '#666', margin: 0 }}>
              Use any mock email to register or log in locally without setting up OAuth keys.
            </p>
            <form onSubmit={handleMockLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input
                type="email"
                required
                placeholder="developer@mminmax.local"
                value={mockEmail}
                onChange={e => setMockEmail(e.target.value)}
                style={{ width: '100%', padding: '0.3rem', fontSize: '0.75rem', border: '2px solid #000' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMockPanel(false)}
                  className="game-btn"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', border: '2px solid #000', background: '#e5e7eb' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="game-btn"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', border: '2px solid #000', background: 'var(--neon-cyan)' }}
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USERNAME REGISTRATION DIALOG */}
      {showUsernameModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="terminal-panel" style={{ width: '320px', background: '#fff', border: '4px solid #000', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--neon-pink)', borderBottom: '3px solid #000', paddingBottom: '0.4rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CrystalIcon size={16} color="var(--neon-pink)" /> Choose Username
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#444', margin: 0 }}>
              Enter a custom username for your cloud sync profile. Must be alphanumeric (3-15 chars).
            </p>
            <form onSubmit={submitUsername} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input
                type="text"
                required
                minLength={3}
                maxLength={15}
                placeholder="e.g. minmax_crusader"
                value={tempUsername}
                onChange={e => setTempUsername(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '2px solid #000', textTransform: 'lowercase' }}
              />
              <button
                type="submit"
                className="game-btn"
                style={{ padding: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid #000', background: 'var(--neon-cyan)', color: '#000', textTransform: 'uppercase' }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
