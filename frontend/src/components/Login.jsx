import { useEffect, useState } from 'react';
import AuthLayout from './AuthLayout.jsx';
import { saveTokens } from '../lib/auth.js';

const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;

const STATUS_MESSAGES = {
  400: 'Girdiğin bilgiler geçersiz.',
  401: 'Kullanıcı adı veya şifre hatalı.',
  429: 'Çok fazla deneme yaptın. Biraz sonra tekrar dene.',
  500: 'Sunucuda bir hata oluştu. Tekrar dene.',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Giriş — SourceMesh';
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const name = username.trim();

    if (!name) {
      setError('Kullanıcı adı gerekli.');
      return;
    }

    if (name.length > USERNAME_MAX) {
      setError(`Kullanıcı adı en fazla ${USERNAME_MAX} karakter olabilir.`);
      return;
    }

    if (password.length < PASSWORD_MIN) {
      setError(`Şifre en az ${PASSWORD_MIN} karakter olmalı.`);
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
          STATUS_MESSAGES[response.status] ||
            data.error ||
            'Giriş yapılamadı. Lütfen tekrar dene.',
        );
        return;
      }

      try {
        saveTokens(data.accessToken, data.refreshToken);
      } catch {
        setError('Oturum bilgileri kaydedilemedi. Tarayıcı depolamasını kontrol et.');
        return;
      }

      window.location.replace('/profile');
    } catch {
      setError('Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">giriş</span>
      <h1>Tekrar hoş geldin</h1>
      <p className="auth-sub">
        Kullanıcı adın ve şifrenle oturum aç, kaldığın yerden devam et.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Kullanıcı adı</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            maxLength={USERNAME_MAX}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="kullanici_adi"
          />
        </label>

        <label className="field">
          <span>Şifre</span>
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
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>

        <p className="auth-note">ücretsiz · açık kaynak · REST API</p>

        <p className="auth-alt">
          Hesabın yok mu? <a href="/register">Hesap oluştur</a>
        </p>
      </form>
    </AuthLayout>
  );
}
