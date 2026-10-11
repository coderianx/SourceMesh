import { useEffect, useState } from 'react';
import Comments from './Comments.jsx';
import FlowPost from './FlowPost.jsx';
import ProfileHeader from './ProfileHeader.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import { isAuthenticated } from '../lib/auth.js';
import { t } from '../lib/i18n.js';
import logo from '../assets/logo.svg';
import '../App.css';

export default function PublicProfile({ username }) {
  const authed = isAuthenticated();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = `@${username} — SourceMesh`;
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        const response = await fetch(
          `/api/v1/profile/${encodeURIComponent(username)}`,
        );

        if (response.status === 404) {
          if (!cancelled) {
            setNotFound(true);
          }
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
            setError(t('Profile could not be loaded. Please try again.'));
          }
          return;
        }

        if (!cancelled) {
          setUser({ ...data, mesflows: data.mesflows || [] });
        }
      } catch {
        if (!cancelled) {
          setError(
            t('The server could not be reached. Check your connection and try again.'),
          );
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
  }, [username, attempt]);

  return (
    <div className="profile-page">
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="/" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <div className="nav-actions" style={{ marginLeft: 'auto' }}>
            <SettingsMenu />
            <a href="/login" className="btn btn-secondary nav-cta">
              {t('Sign In')}
            </a>
            <a href="/register" className="btn btn-primary nav-cta">
              {t('Create Account')}
            </a>
          </div>
        </div>
      </header>

      <main className="profile-main">
        {loading ? (
          <div className="container">
            <p className="profile-status">{t('Loading profile…')}</p>
          </div>
        ) : notFound ? (
          <div className="container">
            <div className="profile-status">
              <p role="alert">{t('@{username} could not be found.', { username })}</p>
              <a href="/" className="btn btn-secondary">
                {t('Back to home page')}
              </a>
            </div>
          </div>
        ) : error ? (
          <div className="container">
            <div className="profile-status">
              <p role="alert">{error}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                {t('Retry')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-banner" aria-hidden="true" />
            <div className="container">
              <ProfileHeader
                username={user.username}
                id={user.id}
                count={user.mesflows.length}
              />

              <section className="profile-feed" aria-labelledby="public-feed-title">
                <div className="profile-tabs">
                  <h2 id="public-feed-title" className="profile-tab active">
                    {t('Posts')}
                  </h2>
                </div>

                {user.mesflows.length === 0 ? (
                  <p className="profile-empty">
                    {t("This user hasn't shared a meshflow yet.")}
                  </p>
                ) : (
                  <div className="post-list">
                    {user.mesflows.map((flow) => (
                      <FlowPost key={flow.id} username={user.username} flow={flow}>
                        {authed && <Comments meshflowId={flow.id} />}
                      </FlowPost>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
