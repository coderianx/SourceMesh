import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '../lib/format.js';
import { t } from '../lib/i18n.js';
import logo from '../assets/logo.svg';
import '../App.css';

export default function MeshWriteView({ id }) {
  const [write, setWrite] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = write
      ? `${write.title} — SourceMesh`
      : t('MeshWrite — SourceMesh');
  }, [write]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');

      try {
        const response = await fetch(
          `/api/v1/meshwrite/${encodeURIComponent(id)}`,
        );

        if (response.status === 400 || response.status === 404) {
          if (!cancelled) {
            setStatus('notFound');
          }
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data.id) {
          if (!cancelled) {
            setStatus('error');
          }
          return;
        }

        if (!cancelled) {
          setWrite(data);
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
  }, [id, attempt]);

  return (
    <div className="mw-page">
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="/" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <div className="nav-actions" style={{ marginLeft: 'auto' }}>
            {write && (
              <a
                href={`/@${encodeURIComponent(write.username)}?tab=meshwrites`}
                className="btn btn-secondary btn-sm"
              >
                {t('Back to profile')}
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mw-main">
        <div className="container">
          {status === 'loading' ? (
            <p className="profile-status">{t('Loading MeshWrite…')}</p>
          ) : status === 'notFound' ? (
            <div className="profile-status">
              <p role="alert">{t('This MeshWrite could not be found.')}</p>
              <a href="/" className="btn btn-secondary">
                {t('Back to home page')}
              </a>
            </div>
          ) : status === 'error' ? (
            <div className="profile-status">
              <p role="alert">
                {t('The MeshWrite could not be loaded. Please try again.')}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                {t('Retry')}
              </button>
            </div>
          ) : (
            <article className="mw-view">
              <header>
                <h1 className="mw-view-title">{write.title}</h1>
                <p className="mw-view-meta">
                  <a href={`/@${encodeURIComponent(write.username)}`}>
                    @{write.username}
                  </a>
                  <span aria-hidden="true">·</span>
                  <time dateTime={write.created_at}>{formatDate(write.created_at)}</time>
                </p>
              </header>
              <div className="mw-markdown mw-view-body">
                <Markdown remarkPlugins={[remarkGfm]}>{write.content}</Markdown>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
