import { ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import { t } from '../lib/i18n.js';

export default function FinalCta() {
  return (
    <section className="section" id="katil" aria-labelledby="katil-title">
      <div className="container">
        <div className="final">
          <span className="eyebrow">{t('join')}</span>
          <h2 id="katil-title">{t('You should join too.')}</h2>
          <p>
            {t('Create your profile, share your first meshflow. The rest is a few clicks.')}
          </p>
          <div className="hero-ctas">
            <a href="/register" className="btn btn-primary btn-lg">
              {t('Create Account')}
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              {t('See the Code First')}
            </a>
          </div>
          <p className="final-note">{t('free registration · open source · for developers')}</p>
        </div>
      </div>
    </section>
  );
}
