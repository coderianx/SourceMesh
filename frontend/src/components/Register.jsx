import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';

const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;

const STATUS_MESSAGES = {
  400: 'Girdiğin bilgiler geçersiz.',
  409: 'Bu kullanıcı adı zaten alınmış.',
  429: 'Çok fazla deneme yaptın. Biraz sonra tekrar dene.',
  500: 'Sunucuda bir hata oluştu. Tekrar dene.',
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    document.title = 'Kayıt — SourceMesh';
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
          STATUS_MESSAGES[response.status] ||
            data.error ||
            'Kayıt tamamlanamadı. Lütfen tekrar dene.',
        );
        return;
      }

      setCreated(true);
    } catch {
      setError('Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <span className="eyebrow">kayıt</span>
      <h1>Hesabını oluştur</h1>
      <p className="auth-sub">
        Kullanıcı adını ve şifreni belirle, ağa katıl. Ücretsiz ve tamamen açık
        kaynak.
      </p>

      {created ? (
        <div className="auth-done" role="status">
          <span className="auth-done-icon" aria-hidden="true">
            <Check />
          </span>
          <h2>Hesabın hazır</h2>
          <p>Artık ağın bir düğümüsün. Akışta görüşürüz.</p>
          <div className="auth-actions">
            <a href="/login" className="btn btn-primary">
              Giriş yap
            </a>
            <a href="/" className="btn btn-secondary">
              Ana sayfa
            </a>
          </div>
        </div>
      ) : (
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
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="en az 6 karakter"
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
            {loading ? 'Oluşturuluyor…' : 'Hesap Oluştur'}
          </button>

          <p className="auth-note">ücretsiz · açık kaynak · REST API</p>

          <p className="auth-alt">
            Zaten hesabın var mı? <a href="/login">Giriş yap</a>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
