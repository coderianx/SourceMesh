import GithubIcon from './GithubIcon.jsx';
import logo from '../assets/logo.svg';

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
            Geliştiriciler için açık kaynaklı sosyal ağ. Paylaş, sergile, bağ
            kur — toplulukla birlikte büyüyor.
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
          <a href="/login">Giriş Yap</a>
          <a href="/register">Hesap Oluştur</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 SourceMesh</span>
          <span className="right">açık kaynak · geliştiriciler için</span>
        </div>
      </div>
    </footer>
  );
}
