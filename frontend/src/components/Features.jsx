import {
  KeyRound,
  Newspaper,
  ShieldCheck,
  SquareTerminal,
  UserRound,
  Waypoints,
} from 'lucide-react';
import { t } from '../lib/i18n.js';

const FEATURES = [
  {
    icon: Newspaper,
    title: t('Meshflow feed'),
    text: t(
      'Create short posts; they show up in the feed and on your profile, and you can delete them.',
    ),
  },
  {
    icon: UserRound,
    title: t('Profile page'),
    text: t(
      'When you sign in, your account info and meshflows are collected on a single page.',
    ),
  },
  {
    icon: KeyRound,
    title: t('JWT sessions'),
    text: t('Short-lived access tokens and a refresh token stored in the database.'),
  },
  {
    icon: ShieldCheck,
    title: t('Security basics'),
    text: t(
      'Passwords are hashed with bcrypt; a per-IP rate limit is applied at the endpoints.',
    ),
  },
  {
    icon: SquareTerminal,
    title: t('REST API'),
    text: t('The whole app works with a simple JSON-speaking HTTP API.'),
  },
  {
    icon: Waypoints,
    title: t('Few dependencies'),
    text: t('Go, PostgreSQL, Redis and React. The dependency list is kept short.'),
  },
];

export default function Features() {
  return (
    <section className="section" id="ozellikler" aria-labelledby="ozellikler-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('features')}</span>
          <h2 id="ozellikler-title">{t('A simple but working core')}</h2>
          <p>
            {t(
              "Right now there's account, posting and profile. The rest will be added over time.",
            )}
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <feature.icon />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
