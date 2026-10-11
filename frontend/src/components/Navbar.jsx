import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import logo from '../assets/logo.svg';

const LINKS = [
  { href: '#ozellikler', label: 'Özellikler' },
  { href: '#nasil-calisir', label: 'Nasıl Çalışır' },
  { href: '#acik-kaynak', label: 'Açık Kaynak' },
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
            <a href="/login" className="btn btn-ghost">
              Giriş Yap
            </a>
            <a href="/register" className="btn btn-primary nav-cta">
              Hemen Katıl
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
            Giriş Yap
          </a>
          <a href="/register" className="btn btn-primary" style={{ flex: 1 }}>
            Hemen Katıl
          </a>
        </div>
      </div>
    </>
  );
}
