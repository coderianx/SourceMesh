import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { clearTokens, getAccessToken, isAuthenticated } from '../lib/auth.js';
import { t } from '../lib/i18n.js';
import '../App.css';

const NAME_MAX_LENGTH = 75;
const DESCRIPTION_MAX_LENGTH = 300;

// The API checks name and description by byte length, so validate the same way.
function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

export default function Nodes() {
  const [topNodes, setTopNodes] = useState([]);
  const [topStatus, setTopStatus] = useState('loading');
  const [joinedNodes, setJoinedNodes] = useState([]);
  const [joinedStatus, setJoinedStatus] = useState(
    isAuthenticated() ? 'loading' : 'guest',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingNode, setPendingNode] = useState(null);
  const [actionError, setActionError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const authenticated = isAuthenticated();
  const joinedIds = new Set(joinedNodes.map((node) => node.id));

  useEffect(() => {
    let cancelled = false;

    async function loadTop() {
      setTopStatus('loading');

      try {
        const response = await fetch('/api/v1/node/top');

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setTopStatus('error');
          return;
        }

        setTopNodes(Array.isArray(data.nodes) ? data.nodes : []);
        setTopStatus('ready');
      } catch {
        if (!cancelled) {
          setTopStatus('error');
        }
      }
    }

    loadTop();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    let cancelled = false;

    async function loadJoined() {
      const token = getAccessToken();

      if (!token) {
        setJoinedNodes([]);
        setJoinedStatus('guest');
        return;
      }

      setJoinedStatus('loading');

      try {
        const response = await fetch('/api/v1/node/joined', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          clearTokens();

          if (!cancelled) {
            setJoinedNodes([]);
            setJoinedStatus('guest');
          }

          return;
        }

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setJoinedStatus('error');
          return;
        }

        setJoinedNodes(Array.isArray(data.nodes) ? data.nodes : []);
        setJoinedStatus('ready');
      } catch {
        if (!cancelled) {
          setJoinedStatus('error');
        }
      }
    }

    loadJoined();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function refresh() {
    setAttempt((value) => value + 1);
  }

  function toggleComposer() {
    if (!isAuthenticated()) {
      window.location.assign('/login');
      return;
    }

    setFormOpen((value) => !value);
    setFormError('');
  }

  async function handleCreate(event) {
    event.preventDefault();

    const nameValue = name.trim();
    const descriptionValue = description.trim();

    if (!nameValue) {
      setFormError(t('Name is required.'));
      return;
    }

    if (byteLength(nameValue) > NAME_MAX_LENGTH) {
      setFormError(
        t('Name can be at most {max} characters.', { max: NAME_MAX_LENGTH }),
      );
      return;
    }

    if (!descriptionValue) {
      setFormError(t('Description is required.'));
      return;
    }

    if (byteLength(descriptionValue) > DESCRIPTION_MAX_LENGTH) {
      setFormError(
        t('Description can be at most {max} characters.', {
          max: DESCRIPTION_MAX_LENGTH,
        }),
      );
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      const response = await fetch('/api/v1/node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          name: nameValue,
          description: descriptionValue,
        }),
      });

      if (response.status === 401) {
        clearTokens();
        window.location.assign('/login');
        return;
      }

      if (response.status === 409) {
        setFormError(t('This node name is already taken.'));
        setCreating(false);
        return;
      }

      if (!response.ok) {
        setFormError(t('The node could not be created. Please try again.'));
        setCreating(false);
        return;
      }

      setName('');
      setDescription('');
      setFormOpen(false);
      setCreating(false);
      refresh();
    } catch {
      setFormError(t('The server could not be reached. Check your connection.'));
      setCreating(false);
    }
  }

  async function handleMembership(node, action) {
    const token = getAccessToken();

    if (!token) {
      window.location.assign('/login');
      return;
    }

    setPendingNode(node.id);
    setActionError('');

    try {
      const response = await fetch(
        `/api/v1/node/${encodeURIComponent(node.name)}/${action}`,
        {
          method: action === 'join' ? 'POST' : 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 401) {
        clearTokens();
        window.location.assign('/login');
        return;
      }

      // 404 and 409 mean the server is already in the target state
      // (not a member / already a member); syncing the list is enough.
      if (!response.ok && response.status !== 404 && response.status !== 409) {
        setActionError(
          action === 'join'
            ? t('The node could not be joined. Please try again.')
            : t('The node could not be left. Please try again.'),
        );
      }

      refresh();
    } catch {
      setActionError(
        action === 'join'
          ? t('The node could not be joined. Please try again.')
          : t('The node could not be left. Please try again.'),
      );
    } finally {
      setPendingNode(null);
    }
  }

  return (
    <>
      <div className="dash-container">
        <header className="dash-head">
          <h1>{t('Nodes')}</h1>
          <p>{t('Communities on the network. Join a node to post and share.')}</p>
        </header>

        {formOpen && (
          <form
            id="node-composer"
            className="node-composer"
            onSubmit={handleCreate}
          >
            <label className="node-field">
              <span>{t('Node name')}</span>
              <input
                type="text"
                maxLength={NAME_MAX_LENGTH}
                placeholder={t('e.g. golang')}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFormError('');
                }}
                autoFocus
              />
            </label>

            <label className="node-field">
              <span>{t('Description')}</span>
              <textarea
                rows={2}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder={t('Describe what this node is about')}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setFormError('');
                }}
              />
            </label>

            {formError && (
              <p className="auth-error" role="alert">
                {formError}
              </p>
            )}

            <div className="node-composer-foot">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setFormOpen(false);
                  setFormError('');
                  setName('');
                  setDescription('');
                }}
              >
                {t('Discard')}
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={creating}
              >
                {creating ? t('Creating…') : t('Create node')}
              </button>
            </div>
          </form>
        )}

        <section className="node-section" aria-labelledby="node-top-heading">
          <h2 id="node-top-heading" className="node-section-head">
            {t('Popular nodes')}
          </h2>

          {topStatus === 'loading' ? (
            <p className="node-status">{t('Loading nodes…')}</p>
          ) : topStatus === 'error' ? (
            <div className="node-status">
              <p role="alert">
                {t('The nodes could not be loaded. Please try again.')}
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={refresh}
              >
                {t('Retry')}
              </button>
            </div>
          ) : topNodes.length === 0 ? (
            <p className="node-status">{t('No nodes yet. Create the first one.')}</p>
          ) : (
            <ol className="node-list">
              {topNodes.map((node, index) => {
                const joined = joinedIds.has(node.id);
                const pending = pendingNode === node.id;

                return (
                  <li className="node-card" key={node.id}>
                    <span className="node-rank" aria-hidden="true">
                      {index + 1}
                    </span>

                    <div className="node-card-main">
                      <h3 className="node-name">{node.name}</h3>
                      <p className="node-desc">{node.description}</p>
                      <p className="node-meta">
                        {t('{count} members', { count: node.member_count })}
                      </p>
                    </div>

                    {authenticated &&
                      (joined ? (
                        <span className="node-tag">{t('Joined')}</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm node-action"
                          onClick={() => handleMembership(node, 'join')}
                          disabled={pending}
                        >
                          {pending ? t('Joining…') : t('Join')}
                        </button>
                      ))}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <aside className="dash-rail" aria-label={t('Nodes')}>
        <button
          type="button"
          className="btn btn-primary dash-rail-btn"
          aria-expanded={formOpen}
          aria-controls="node-composer"
          onClick={toggleComposer}
        >
          <Plus aria-hidden="true" />
          {t('Create New Node')}
        </button>

        <section
          className="dash-rail-section"
          aria-labelledby="node-joined-heading"
        >
          <h2 id="node-joined-heading" className="node-section-head">
            {t('Your nodes')}
          </h2>

          <div className="node-joined-card">
            {!authenticated ? (
              <p className="node-empty">
                {t('Sign in to create and join nodes.')}{' '}
                <a className="node-link" href="/login">
                  {t('Sign In')}
                </a>
              </p>
            ) : joinedStatus === 'loading' ? (
              <p className="node-empty">{t('Loading nodes…')}</p>
            ) : joinedStatus === 'error' ? (
              <p className="node-empty" role="alert">
                {t('The nodes could not be loaded. Please try again.')}
              </p>
            ) : joinedNodes.length === 0 ? (
              <p className="node-empty">{t("You haven't joined a node yet.")}</p>
            ) : (
              <ul className="node-joined-list">
                {joinedNodes.map((node) => {
                  const pending = pendingNode === node.id;

                  return (
                    <li className="node-joined-item" key={node.id}>
                      <h3 className="node-name">{node.name}</h3>

                      <div className="node-joined-foot">
                        <p className="node-meta">
                          <span className="node-tag">
                            {node.role === 'owner' ? t('Owner') : t('Member')}
                          </span>
                          {t('{count} members', { count: node.member_count })}
                        </p>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm node-action"
                          onClick={() => handleMembership(node, 'leave')}
                          disabled={pending}
                        >
                          {pending ? t('Leaving…') : t('Leave')}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {actionError && (
            <p className="auth-error node-action-error" role="alert">
              {actionError}
            </p>
          )}
        </section>
      </aside>
    </>
  );
}
