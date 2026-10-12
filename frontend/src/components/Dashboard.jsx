import { useEffect, useState } from 'react';
import { LogOut, Moon, Rss, Settings, Sun, UserRound } from 'lucide-react';
import SettingsMenu from './SettingsMenu.jsx';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import { formatDate } from '../lib/format.js';
import { t } from '../lib/i18n.js';
import logo from '../assets/logo.svg';
import '../App.css';

const THEME_KEY = 'theme';
const EXCERPT_MAX = 240;

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage is unavailable; the theme just won't persist.
  }
}

// Markdown is rendered on the MeshWrite page; in the feed a plain-text
// excerpt is enough, so the syntax noise is stripped away here.
function toExcerpt(content) {
  const text = String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= EXCERPT_MAX) {
    return text;
  }

  return `${text.slice(0, EXCERPT_MAX).trimEnd()}…`;
}

export default function Dashboard() {
  const [section, setSection] = useState('feed');
  const [theme, setTheme] = useState(getStoredTheme);
  const [user, setUser] = useState(null);
  const [meshwrites, setMeshwrites] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = t('Dashboard — SourceMesh');
  }, []);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return undefined;
    }

    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          clearTokens();
          return;
        }

        if (!response.ok) {
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!cancelled && data && data.username) {
          setUser(data);
        }
      } catch {
        // The account info in the sidebar is optional; ignore failures.
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');

      try {
        const response = await fetch('/api/v1/meshwrite/latest');

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          if (!cancelled) {
            setStatus('error');
          }
          return;
        }

        if (!cancelled) {
          setMeshwrites(Array.isArray(data.meshwrites) ? data.meshwrites : []);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
  }

  function handleLogout() {
    clearTokens();
    window.location.replace('/');
  }

  return (
    <div className={`dashboard-page${theme === 'light' ? ' theme-light' : ''}`}>
      <aside className="dash-sidebar">
        <a
          href="/"
          className="brand dash-brand"
          aria-label={t('SourceMesh home page')}
        >
          <img src={logo} alt="" width="28" height="28" className="brand-logo" />
          <span className="dash-brand-label">SourceMesh</span>
        </a>

        <nav className="dash-nav" aria-label={t('Dashboard')}>
          <button
            type="button"
            className={`dash-nav-item${section === 'feed' ? ' active' : ''}`}
            aria-current={section === 'feed' ? 'page' : undefined}
            aria-label={t('Feed')}
            onClick={() => setSection('feed')}
          >
            <Rss aria-hidden="true" />
            <span className="dash-label">{t('Feed')}</span>
          </button>
        </nav>

        <div className="dash-sidebar-foot">
          <SettingsMenu
            wrapperClassName="dash-settings"
            triggerClassName="dash-nav-item"
            trigger={
              <>
                <Settings aria-hidden="true" />
                <span className="dash-label">{t('Settings')}</span>
              </>
            }
          >
            {user ? (
              <>
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
              </>
            ) : (
              <a className="settings-item" role="menuitem" href="/login">
                {t('Sign In')}
              </a>
            )}
          </SettingsMenu>

          <button
            type="button"
            className="dash-nav-item"
            aria-label={t('Theme')}
            aria-pressed={theme === 'light'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
            <span className="dash-label">{t('Theme')}</span>
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-container">
          {section === 'feed' && (
            <>
              <header className="dash-head">
                <h1>{t('Feed')}</h1>
                <p>{t('The most recent MeshWrites from the network.')}</p>
              </header>

              {status === 'loading' ? (
                <p className="dash-status">{t('Loading feed…')}</p>
              ) : status === 'error' ? (
                <div className="dash-status">
                  <p role="alert">
                    {t('The feed could not be loaded. Please try again.')}
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAttempt((value) => value + 1)}
                  >
                    {t('Retry')}
                  </button>
                </div>
              ) : meshwrites.length === 0 ? (
                <p className="dash-status">
                  {t('No MeshWrites yet. Be the first to write one.')}
                </p>
              ) : (
                <ul className="dash-feed-list">
                  {meshwrites.map((write) => (
                    <li key={write.id}>
                      <a
                        className="dash-feed-card"
                        href={`/meshwrite/view/${write.id}`}
                      >
                        <h2 className="dash-feed-title">{write.title}</h2>
                        <p className="dash-feed-meta">
                          <span className="dash-feed-author">
                            @{write.username}
                          </span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={write.created_at}>
                            {formatDate(write.created_at)}
                          </time>
                        </p>
                        <p className="dash-feed-excerpt">{toExcerpt(write.content)}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
