import { ArrowRight } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import MeshBackground from './MeshBackground.jsx';
import logo from '../assets/logo.svg';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <MeshBackground />
      <div className="container">
        <div className="hero-inner">
          <img src={logo} alt="" width="56" height="56" className="hero-mark" />
          <span className="eyebrow">açık kaynak · geliştiriciler için</span>
          <h1 id="hero-title">Geliştiricilerin buluşma noktası.</h1>
          <p className="hero-sub">
            SourceMesh, geliştiriciler için açık kaynaklı bir sosyal ağ.
            Hesabını oluştur, meshflow paylaş; paylaştıkların profilinde
            birikir.
          </p>
          <div className="hero-ctas">
            <a href="/register" className="btn btn-primary btn-lg">
              Ücretsiz Başla
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              GitHub’da İncele
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
