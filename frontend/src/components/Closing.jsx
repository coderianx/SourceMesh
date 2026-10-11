import { ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';

export default function FinalCta() {
  return (
    <section className="section" id="katil" aria-labelledby="katil-title">
      <div className="container">
        <div className="final">
          <span className="eyebrow">katıl</span>
          <h2 id="katil-title">Ağın bir düğümü de sen ol.</h2>
          <p>
            Profilini oluştur, ilk projeni vitrine koy, ilk katkını yap.
            Topluluk seni kodunla karşılayacak.
          </p>
          <div className="hero-ctas">
            <a href="#top" className="btn btn-primary btn-lg">
              Hesap Oluştur
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              Önce Kodu Gör
            </a>
          </div>
          <p className="final-note">ücretsiz · açık kaynak · verilerin dışa aktarılabilir</p>
        </div>
      </div>
    </section>
  );
}
