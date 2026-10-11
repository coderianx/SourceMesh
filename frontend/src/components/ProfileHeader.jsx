import { t } from '../lib/i18n.js';

export default function ProfileHeader({ username, id, count, children }) {
  return (
    <section className="profile-info" aria-label={`${username} profili`}>
      <div className="profile-identity">
        <span className="profile-avatar" aria-hidden="true">
          {username.slice(0, 1).toUpperCase()}
        </span>
        {children && <div className="profile-actions">{children}</div>}
      </div>
      <h1 className="profile-name">{username}</h1>
      <p className="profile-handle">@{username}</p>
      <p className="profile-stats">
        <span>{t('{count} posts', { count })}</span>
        <span aria-hidden="true">·</span>
        <span>#{id}</span>
      </p>
    </section>
  );
}
