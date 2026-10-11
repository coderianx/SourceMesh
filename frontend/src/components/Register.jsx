import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import { t } from '../lib/i18n.js';

const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;

const STATUS_KEYS = {
  400: 'Invalid info submitted.',
  409: 'This username is already taken.',
  429: "You've tried too many times. Try again a bit later.",
  500: 'A server error occurred. Try again.',
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    document.title = t('Create account — SourceMesh');
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
      const response = await fetch('/api/v1/auth/register', {
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
            t('Registration could not be completed. Please try again.'),
        );
        return;
      }

      setCreated(true);
    } catch {
      setError(t('The server could not be reached. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">{t('sign up')}</span>
      <h1>{t('Create your account')}</h1>
      <p className="auth-sub">
        {t('Set a username and password and join the network. Free and fully open source.')}
      </p>

      {created ? (
        <div className="auth-done" role="status">
          <span className="auth-done-icon" aria-hidden="true">
            <Check />
          </span>
          <h2>{t('Your account is ready')}</h2>
          <p>{t("You're now a node of the network. See you in the feed.")}</p>
          <div className="auth-actions">
            <a href="/login" className="btn btn-primary">
              {t('Sign in')}
            </a>
            <a href="/" className="btn btn-secondary">
              {t('Home')}
            </a>
          </div>
        </div>
      ) : (
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
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('at least {min} characters', { min: PASSWORD_MIN })}
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
            {loading ? t('Creating…') : t('Create Account')}
          </button>

          <p className="auth-note">{t('free · open source · REST API')}</p>

          <p className="auth-alt">
            {t('Already have an account?')} <a href="/login">{t('Sign in')}</a>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
