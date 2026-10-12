import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clearTokens, getAccessToken, isAuthenticated } from '../lib/auth.js';
import { t } from '../lib/i18n.js';
import logo from '../assets/logo.svg';
import '../App.css';

const TITLE_MAX_LENGTH = 200;

// The API checks the title by byte length, so validate the same way.
function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

export default function MeshWriteNew() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = t('New MeshWrite — SourceMesh');
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.replace('/login');
    }
  }, []);

  if (!isAuthenticated()) {
    return null;
  }

  async function handleCreate(event) {
    event.preventDefault();

    const titleValue = title.trim();
    const contentValue = content.trim();

    if (!titleValue) {
      setError(t('Title is required.'));
      return;
    }

    if (byteLength(titleValue) > TITLE_MAX_LENGTH) {
      setError(t('Title is too long.'));
      return;
    }

    if (!contentValue) {
      setError(t('Content is required.'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/v1/meshwrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ title: titleValue, content: contentValue }),
      });

      if (response.status === 401) {
        clearTokens();
        window.location.replace('/login');
        return;
      }

      if (!response.ok) {
        setError(t('The MeshWrite could not be created. Please try again.'));
        setSubmitting(false);
        return;
      }

      window.location.assign('/profile?tab=meshwrites');
    } catch {
      setError(
        t('The server could not be reached. Check your connection and try again.'),
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mw-page">
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="/" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <div className="nav-actions" style={{ marginLeft: 'auto' }}>
            <a href="/profile" className="btn btn-secondary btn-sm">
              {t('Back to profile')}
            </a>
          </div>
        </div>
      </header>

      <main className="mw-main">
        <div className="container">
          <h1 className="sr-only">New MeshWrite</h1>

          <form className="mw-form" onSubmit={handleCreate}>
            <label className="mw-title-field">
              <span className="mw-field-label">{t('Title')}</span>
              <input
                type="text"
                className="mw-title-input"
                maxLength={TITLE_MAX_LENGTH}
                placeholder={t('Give your MeshWrite a title')}
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError('');
                }}
                autoFocus
              />
            </label>

            <div className="mw-editor">
              <div className="mw-pane">
                <label className="mw-pane-head" htmlFor="meshwrite-content">
                  Edit
                </label>
                <textarea
                  id="meshwrite-content"
                  className="mw-textarea"
                  placeholder={t('Write in Markdown…')}
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setError('');
                  }}
                />
              </div>

              <section className="mw-pane" aria-labelledby="meshwrite-preview-head">
                <h2 id="meshwrite-preview-head" className="mw-pane-head">
                  Preview
                </h2>
                <div className="mw-preview mw-markdown">
                  {content.trim() ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                  ) : (
                    <p className="mw-preview-empty">{t('Nothing to preview yet.')}</p>
                  )}
                </div>
              </section>
            </div>

            <div className="mw-foot">
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !title.trim() || !content.trim()}
              >
                {submitting ? t('Creating…') : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
