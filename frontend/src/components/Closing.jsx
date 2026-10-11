import { ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';

export default function FinalCta() {
  return (
    <section className="section" id="katil" aria-labelledby="katil-title">
      <div className="container">
        <div className="final">
          <span className="eyebrow">katıl</span>
          <h2 id="katil-title">Sen de katıl.</h2>
          <p>
            Profilini oluştur, ilk meshflow’unu paylaş. Kalanı birkaç tık.
          </p>
          <div className="hero-ctas">
            <a href="/register" className="btn btn-primary btn-lg">
              Hesap Oluştur
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              Önce Kodu Gör
            </a>
          </div>
          <p className="final-note">kayıt ücretsiz · açık kaynak · geliştiriciler için</p>
        </div>
      </div>
    </section>
  );
}
