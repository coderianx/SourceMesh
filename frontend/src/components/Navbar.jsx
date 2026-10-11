import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import logo from '../assets/logo.svg';
import { t } from '../lib/i18n.js';

const LINKS = [
  { href: '#ozellikler', label: t('Features') },
  { href: '#nasil-calisir', label: t('How It Works') },
  { href: '#acik-kaynak', label: t('Open Source') },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="#top" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>

          <nav className="nav-links" aria-label="Ana gezinti">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <a
              className="nav-github"
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub reposu (yeni sekmede açılır)"
            >
              <GithubIcon />
              GitHub
            </a>
            <SettingsMenu />
            <a href="/login" className="btn btn-ghost">
              {t('Sign In')}
            </a>
            <a href="/register" className="btn btn-primary nav-cta">
              {t('Create Account')}
            </a>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        <nav aria-label="Mobil gezinti">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mobile-actions">
          <a href="/login" className="btn btn-secondary" style={{ flex: 1 }}>
            {t('Sign In')}
          </a>
          <a href="/register" className="btn btn-primary" style={{ flex: 1 }}>
            {t('Create Account')}
          </a>
        </div>
      </div>
    </>
  );
}
