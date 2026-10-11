import { useEffect, useState } from 'react';
import AuthLayout from './AuthLayout.jsx';
import { saveTokens } from '../lib/auth.js';
import { t } from '../lib/i18n.js';

const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;

const STATUS_KEYS = {
  400: 'Invalid info submitted.',
  401: 'Username or password is incorrect.',
  429: "You've tried too many times. Try again a bit later.",
  500: 'A server error occurred. Try again.',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = t('Sign in — SourceMesh');
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const name = username.trim();

    if (!name) {
      setError(t('Username is required.'));
      return;
    }

    if (name.length > USERNAME_MAX) {
      setError(t('Username can be at most {max} characters.', { max: USERNAME_MAX }));
      return;
    }

    if (password.length < PASSWORD_MIN) {
      setError(t('Password must be at least {min} characters.', { min: PASSWORD_MIN }));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          (STATUS_KEYS[response.status] && t(STATUS_KEYS[response.status])) ||
            data.error ||
            t('Sign-in failed. Please try again.'),
        );
        return;
      }

      try {
        saveTokens(data.accessToken, data.refreshToken);
      } catch {
        setError(t('Session info could not be saved. Check your browser storage.'));
        return;
      }

      window.location.replace('/profile');
    } catch {
      setError(t('The server could not be reached. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">{t('sign in')}</span>
      <h1>{t('Welcome back')}</h1>
      <p className="auth-sub">
        {t('Sign in with your username and password and pick up where you left off.')}
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>{t('Username')}</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            maxLength={USERNAME_MAX}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="username"
          />
        </label>

        <label className="field">
          <span>{t('Password')}</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            minLength={PASSWORD_MIN}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? t('Signing in…') : t('Sign In')}
        </button>

        <p className="auth-note">{t('free · open source · REST API')}</p>

        <p className="auth-alt">
          {t("Don't have an account?")} <a href="/register">{t('Create one')}</a>
        </p>
      </form>
    </AuthLayout>
  );
}
