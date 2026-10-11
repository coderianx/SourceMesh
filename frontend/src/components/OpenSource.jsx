import { Check, Star } from 'lucide-react';

const POINTS = [
  {
    title: 'Kaynak kod GitHub’da',
    text: 'Çekirdeğin tamamı açık; incele, çatalla, eksik gördüğünü bildir.',
  },
  {
    title: 'Küçük ve okunabilir',
    text: 'Az bağımlılık, tek sürüm ve anlaşılır bir paket yapısı.',
  },
  {
    title: 'Katkıya açık',
    text: 'Hata bildirimleri ve pull request’ler memnuniyetle karşılanır.',
  },
];

export default function OpenSource() {
  return (
    <section className="section" id="acik-kaynak" aria-labelledby="acik-kaynak-title">
      <div className="container oss">
        <div>
          <span className="eyebrow">açık kaynak</span>
          <h2 id="acik-kaynak-title">Kaynak kodu açık.</h2>
          <p>
            SourceMesh toplulukla büyüyor. Kodu inceleyebilir, kendi makinende
            çalıştırabilir ve geliştirebilirsin.
          </p>

          <ul className="oss-list">
            {POINTS.map((point) => (
              <li key={point.title}>
                <Check aria-hidden="true" />
                <span>
                  <b>{point.title}</b>
                  <small>{point.text}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className="oss-actions">
            <a
              href="https://github.com/coderianx/SourceMesh"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <Star aria-hidden="true" />
              Repoyu İncele
            </a>
          </div>
        </div>

        <div>
          <div className="install" style={{ marginTop: 0 }}>
            <div className="install-head">coderianx / SourceMesh</div>
            <div className="codeblock">
              <span className="prompt">$ </span>
              <span className="cmd">gh repo clone coderianx/SourceMesh</span>
            </div>
          </div>
          <p className="oss-stack">Go · chi · PostgreSQL · Redis · React · Vite</p>
        </div>
      </div>
    </section>
  );
}
