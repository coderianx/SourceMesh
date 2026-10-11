import GithubIcon from './GithubIcon.jsx';
import logo from '../assets/logo.svg';
import { t } from '../lib/i18n.js';

export default function Footer() {
  return (
    <footer>
      <div className="container footer-main">
        <div className="footer-brand">
          <a href="#top" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <p>
            {t(
              'An open source social network for developers. Share, showcase, connect — growing with the community.',
            )}
          </p>
        </div>

        <nav className="footer-links" aria-label="Alt gezinti">
          <a
            href="https://github.com/coderianx/SourceMesh"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon />
            GitHub
          </a>
          <a href="/login">{t('Sign In')}</a>
          <a href="/register">{t('Create Account')}</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 SourceMesh</span>
          <span className="right">{t('open source · for developers')}</span>
        </div>
      </div>
    </footer>
  );
}
