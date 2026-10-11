import { ArrowRight, Heart, MessageSquare, Repeat2 } from 'lucide-react';
import GithubIcon from './GithubIcon.jsx';
import logo from '../assets/logo.svg';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-inner">
          <img src={logo} alt="" width="48" height="48" className="hero-logo" />
          <span className="eyebrow">açık kaynak · beta</span>
          <h1 id="hero-title">Geliştiricilerin buluşma noktası.</h1>
          <p className="hero-sub">
            Topluluklar kur, akışta tartış, projelerini sergile. SourceMesh;
            forumların, akışın ve vitrinin geliştiriciler için sade birleşimi —
            tamamen açık kaynak.
          </p>
          <div className="hero-ctas">
            <a href="#katil" className="btn btn-primary btn-lg">
              Ücretsiz Başla
              <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <GithubIcon size={16} />
              Kodu İncele
            </a>
          </div>
          <p className="hero-meta">
            kredi kartı gerekmez · kendi sunucunda çalıştır · MIT lisanslı
          </p>
        </div>

        <div className="preview" aria-label="SourceMesh akış önizlemesi">
          <div className="preview-head">
            <span>akıştan bir kesit</span>
            <span className="preview-live">
              <i aria-hidden="true" />
              önizleme
            </span>
          </div>

          <article className="post">
            <div className="post-head">
              <span className="avatar" aria-hidden="true">
                EK
              </span>
              <div>
                <b>Elif Kaya</b>
                <time>@elifk · 12 dk</time>
              </div>
            </div>
            <p className="post-text">
              mesh-cache v2 yayında — dağıtık derleme önbelleği artık arm64
              destekliyor. CI süremiz 8 dakikadan 47 saniyeye düştü.
            </p>
            <div className="codeblock">
              <span className="prompt">$ </span>
              <span className="cmd">cargo install mesh-cache --locked</span>
            </div>
            <div className="post-foot">
              <span>
                <MessageSquare aria-hidden="true" /> 48
              </span>
              <span>
                <Repeat2 aria-hidden="true" /> 132
              </span>
              <span>
                <Heart aria-hidden="true" /> 486
              </span>
            </div>
          </article>

          <article className="post">
            <div className="post-head">
              <span className="avatar" aria-hidden="true">
                MA
              </span>
              <div>
                <b>Mert Arslan</b>
                <time>@merta · 1 sa · t/türkçe-nlp</time>
              </div>
            </div>
            <p className="post-text">
              Duygu analizi için temizlenmiş 12 açık Türkçe veri setini
              paylaştım. Katkıya açık — eksik alanları issue olarak girdim.
            </p>
            <div className="post-foot">
              <span>
                <MessageSquare aria-hidden="true" /> 35
              </span>
              <span>
                <Repeat2 aria-hidden="true" /> 64
              </span>
              <span>
                <Heart aria-hidden="true" /> 210
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
