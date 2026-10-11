import { t } from '../lib/i18n.js';

const STEPS = [
  {
    num: '01',
    title: t('Create an account'),
    text: t('Username and password are enough. No email verification required.'),
  },
  {
    num: '02',
    title: t('Sign in'),
    text: t('After signing in you are redirected to your profile page.'),
  },
  {
    num: '03',
    title: t('Share a meshflow'),
    text: t('Create your first post and let it show up on your profile.'),
  },
];

const SETUP = [
  'git clone https://github.com/coderianx/SourceMesh',
  'cd SourceMesh/backend && go run .',
  'cd SourceMesh/frontend && npm install && npm run dev',
];

export default function HowItWorks() {
  return (
    <section className="section" id="nasil-calisir" aria-labelledby="nasil-calisir-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('how it works')}</span>
          <h2 id="nasil-calisir-title">{t('Start in three steps')}</h2>
          <p>{t('The sign-up form is not tiring, your account is ready right away.')}</p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <article key={step.num} className="step">
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="install">
          <div className="install-head">{t('local setup')}</div>
          <div className="codeblock">
            {SETUP.map((cmd) => (
              <span key={cmd} className="code-line">
                <span className="prompt">$ </span>
                <span className="cmd">{cmd}</span>
              </span>
            ))}
          </div>
          <p className="install-note">
            {t(
              'The backend needs PostgreSQL and Redis; connection details are read from the .env file.',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
