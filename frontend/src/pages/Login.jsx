import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { t } = useTranslation();
  const { user, loginWithGoogle, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already authenticated — redirect to dashboard
  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <div className="login-spinner" />
          <p>Initializing…</p>
        </div>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // the window will redirect, so we keep loading true
    } catch (err) {
      setError(err.message || 'Failed to start authentication');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background grid */}
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />

      <div className="login-container">
        {/* Logo & Branding */}
        <div className="login-brand">
          <img src="/logo.png" alt="Luna logo" className="login-logo" />
          <h1 className="login-title">{t('luna')}</h1>
          <p className="login-subtitle">{t('contentIntelligence')}</p>
        </div>

        {/* Login Form */}
        <div className="login-form">
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-dim)' }}>{t('continueWithYourGoogleAccount')}</p>
          
          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠</span>
              {error === 'invalid_state' && 'Authentication state mismatch. Please try again.'}
              {error === 'auth_failed' && 'Authentication failed. Please try again.'}
              {error === 'invalid_profile' && 'Unable to read your Google profile.'}
              {![ 'invalid_state', 'auth_failed', 'invalid_profile' ].includes(error) && error}
            </div>
          )}

          <button
            type="button"
            className="login-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#ffffff', color: '#1f2937', fontWeight: 500 }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-btn-spinner" />
                Connecting…
              </>
            ) : (
              <>
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: '24px', height: '24px' }} />{t('continueWithGoogle')}</>
            )}
          </button>
        </div>

        <p className="login-footer">{t('securedAccess')}</p>
      </div>
    </div>
  );
}
