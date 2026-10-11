import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import LikeButton from './LikeButton.jsx';
import { formatDate } from '../lib/format.js';

export default function FlowPost({ username, flow, children }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const hasComments = Boolean(children);

  return (
    <article className="post-row">
      <span className="post-avatar" aria-hidden="true">
        {username.slice(0, 1).toUpperCase()}
      </span>
      <div className="post-main">
        <header className="post-meta">
          <b>{username}</b>
          <span className="post-handle">@{username}</span>
          <time dateTime={flow.created_at}>{formatDate(flow.created_at)}</time>
        </header>
        <p className="post-content">{flow.content}</p>
        <div className="post-actions">
          <LikeButton
            meshflowId={flow.id}
            likes={flow.likes}
            liked={flow.liked}
          />
          {hasComments && (
            <button
              type="button"
              className="comment-toggle"
              aria-expanded={commentsOpen}
              onClick={() => setCommentsOpen((value) => !value)}
            >
              <MessageSquare aria-hidden="true" />
              Yorumlar
            </button>
          )}
        </div>
        {hasComments && commentsOpen && (
          <div className="flow-comments">{children}</div>
        )}
      </div>
    </article>
  );
}
