import { useEffect, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import Comments from './Comments.jsx';
import FlowPost from './FlowPost.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import ProfileHeader from './ProfileHeader.jsx';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import { t } from '../lib/i18n.js';
import logo from '../assets/logo.svg';
import '../App.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    document.title = t('Profile — SourceMesh');
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
  }, [attempt]);

  function handleLogout() {
    clearTokens();
    window.location.replace('/');
  }

  async function handleCreate(event) {
    event.preventDefault();

    const value = content.trim();

    if (!value) {
      setPostError(t('Content is required.'));
      return;
    }

    if ([...value].length > 1000) {
      setPostError(t('Content can be at most {max} characters.', { max: 1000 }));
      return;
    }

    setPosting(true);
    setPostError('');

    try {
      const response = await fetch('/api/v1/meshflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ content: value }),
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

      if (!response.ok) {
        setPostError(t('The meshflow could not be created. Please try again.'));
        return;
      }

      setUser((current) => ({
        ...current,
        mesflows: [
          {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
          },
          ...current.mesflows,
        ],
      }));
      setContent('');
      setComposerOpen(false);
    } catch {
      setPostError(
        t('The server could not be reached. Check your connection and try again.'),
      );
    } finally {
      setPosting(false);
    }
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
            {user && (
              <SettingsMenu>
                <a
                  className="settings-item"
                  role="menuitem"
                  href={`/@${encodeURIComponent(user.username)}`}
                >
                  <UserRound aria-hidden="true" />
                  {t('Public profile')}
                </a>
                <button
                  className="settings-item"
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut aria-hidden="true" />
                  {t('Sign Out')}
                </button>
              </SettingsMenu>
            )}
          </div>
        </div>
      </header>

      <main className="profile-main">
        {loading ? (
          <div className="container">
            <p className="profile-status">{t('Loading profile…')}</p>
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
              >
                {!composerOpen && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setComposerOpen(true)}
                  >
                    + Create MeshFlow
                  </button>
                )}
              </ProfileHeader>

              <section className="profile-feed" aria-labelledby="profile-feed-title">
                <div className="profile-tabs">
                  <h2 id="profile-feed-title" className="profile-tab active">
                    {t('Posts')}
                  </h2>
                </div>

                {composerOpen && (
                  <form className="composer" onSubmit={handleCreate}>
                    <textarea
                      id="meshflow-content"
                      className="composer-input"
                      aria-label={t('New meshflow')}
                      rows={3}
                      maxLength={1000}
                      placeholder={t('What are you building?')}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      autoFocus
                    />
                    <div className="composer-foot">
                      <span className="composer-count">{[...content].length}/1000</span>
                      <div className="composer-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setComposerOpen(false);
                            setContent('');
                            setPostError('');
                          }}
                        >
                          {t('Discard')}
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={posting || !content.trim()}
                        >
                          {posting ? t('Sharing…') : t('Share')}
                        </button>
                      </div>
                    </div>
                    {postError && (
                      <p className="auth-error" role="alert">
                        {postError}
                      </p>
                    )}
                  </form>
                )}

                {user.mesflows.length === 0 ? (
                  <p className="profile-empty">
                    {t(
                      "You haven't shared a meshflow yet. It will appear here once you create your first post.",
                    )}
                  </p>
                ) : (
                  <div className="post-list">
                    {user.mesflows.map((flow) => (
                      <FlowPost key={flow.id} username={user.username} flow={flow}>
                        <Comments meshflowId={flow.id} />
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
