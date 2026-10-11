import { ArrowLeft } from 'lucide-react';
import SettingsMenu from './SettingsMenu.jsx';
import logo from '../assets/logo.svg';
import '../App.css';
import { t } from '../lib/i18n.js';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <header className="auth-top">
        <div className="container auth-top-inner">
          <a href="/" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <div className="auth-top-actions">
            <SettingsMenu />
            <a href="/" className="auth-home">
              <ArrowLeft aria-hidden="true" />
              {t('Home')}
            </a>
          </div>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
