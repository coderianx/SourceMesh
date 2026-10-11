import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import logo from '../assets/logo.svg';
import { t } from '../lib/i18n.js';

export default function Hero() {
  useEffect(() => {
    document.title = t('SourceMesh — The Open Social Network for Developers');
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-inner">
          <img src={logo} alt="" width="56" height="56" className="hero-mark" />
          <span className="eyebrow">{t('open source · for developers')}</span>
          <h1 id="hero-title">{t('The meeting point of developers.')}</h1>
          <p className="hero-sub">
            {t(
              'SourceMesh is an open source social network for developers. Create your account, share a meshflow; what you share builds up on your profile.',
            )}
          </p>
          <div className="hero-ctas">
            <a href="/register" className="btn btn-primary btn-lg">
              {t('Start Free')}
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              {t('Check it out on GitHub')}
            </a>
          </div>
          <p className="hero-meta">{t('free · open source · for developers')}</p>
        </div>
      </div>
    </section>
  );
}
