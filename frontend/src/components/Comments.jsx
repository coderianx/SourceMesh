import { useEffect, useState } from 'react';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import { formatDate } from '../lib/format.js';
import { t } from '../lib/i18n.js';

export default function Comments({ meshflowId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authExpired, setAuthExpired] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/v1/meshflow/${meshflowId}/comments`,
          {
            headers: { Authorization: `Bearer ${getAccessToken()}` },
          },
        );

        if (response.status === 401) {
          clearTokens();
          if (!cancelled) {
            setAuthExpired(true);
          }
          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          if (!cancelled) {
            setError(t("Couldn't load comments. Please try again."));
          }
          return;
        }

        if (!cancelled) {
          setComments(data.comments || []);
        }
      } catch {
        if (!cancelled) {
          setError(t('The server could not be reached. Check your connection.'));
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
  }, [meshflowId]);

  async function handleSubmit(event) {
    event.preventDefault();

    const value = content.trim();

    if (!value) {
      return;
    }

    setPosting(true);
    setError('');

    try {
      const response = await fetch(
        `/api/v1/meshflow/${meshflowId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ content: value }),
        },
      );

      if (response.status === 401) {
        clearTokens();
        setAuthExpired(true);
        return;
      }

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(t("Couldn't send the comment. Please try again."));
        return;
      }

      setComments((current) => [
        ...current,
        {
          id: data.id,
          username: data.username || '',
          content: data.content,
          created_at: data.created_at,
        },
      ]);
      setContent('');
    } catch {
      setError(t('The server could not be reached. Check your connection.'));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flow-comments">
      {authExpired ? (
        <p className="comment-status">
          {t('Your session has expired.')}{' '}
          <a href="/login">{t('Sign in again')}</a>.
        </p>
      ) : (
        <>
          {loading ? (
            <p className="comment-status">{t('Loading comments…')}</p>
          ) : comments.length === 0 ? (
            <p className="comment-empty">{t('No comments yet. Be the first to write one.')}</p>
          ) : (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment">
                  <p className="comment-head">
                    <b>{comment.username}</b>
                    <time dateTime={comment.created_at}>
                      {formatDate(comment.created_at)}
                    </time>
                  </p>
                  <p className="comment-body">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="auth-error comment-error" role="alert">
              {error}
            </p>
          )}

          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="comment-input"
              value={content}
              maxLength={1000}
              placeholder={t('Write a comment…')}
              aria-label={t('Comment')}
              onChange={(event) => setContent(event.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={posting || !content.trim()}
            >
              {posting ? t('Sending…') : t('Send')}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
