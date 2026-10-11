import { formatDate } from '../lib/format.js';

export default function FlowPost({ username, flow, children }) {
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
        {children}
      </div>
    </article>
  );
}
