import { useEffect, useState } from 'react';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import logo from '../assets/logo.svg';
import '../App.css';

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = 'Profil — SourceMesh';
  }, []);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      window.location.replace('/login');
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          clearTokens();
          window.location.replace('/login');
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data.username) {
          if (!cancelled) {
            setError('Profil yüklenemedi. Lütfen tekrar dene.');
          }
          return;
        }

        if (!cancelled) {
          setUser({ ...data, mesflows: data.mesflows || [] });
        }
      } catch {
        if (!cancelled) {
          setError('Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function handleLogout() {
    clearTokens();
    window.location.replace('/');
  }

  return (
    <div className="profile-page">
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="/" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <div className="nav-actions" style={{ marginLeft: 'auto' }}>
            {user && <span className="profile-chip">@{user.username}</span>}
            <button
              type="button"
              className="btn btn-secondary nav-cta"
              onClick={handleLogout}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="container">
          {loading ? (
            <p className="profile-status">Profil yükleniyor…</p>
          ) : error ? (
            <div className="profile-status">
              <p role="alert">{error}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Tekrar dene
              </button>
            </div>
          ) : (
            <>
              <div className="profile-head">
                <span className="avatar avatar-xl" aria-hidden="true">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h1>{user.username}</h1>
                  <p className="profile-meta">
                    <span>#{user.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{user.mesflows.length} meshflow</span>
                  </p>
                </div>
              </div>

              <section className="profile-flows" aria-labelledby="profile-flows-title">
                <h2 id="profile-flows-title">Meshflow’ların</h2>
                {user.mesflows.length === 0 ? (
                  <p className="profile-empty">
                    Henüz meshflow paylaşmadın. İlk gönderini oluşturduğunda
                    burada görünecek.
                  </p>
                ) : (
                  <div className="flow-list">
                    {user.mesflows.map((flow) => (
                      <article key={flow.id} className="flow-card">
                        <p>{flow.content}</p>
                        <time dateTime={flow.created_at}>
                          {formatDate(flow.created_at)}
                        </time>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
