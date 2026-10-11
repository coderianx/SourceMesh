import { Check, Star } from 'lucide-react';

const POINTS = [
  {
    title: 'MIT lisansı',
    text: 'Kilitlenme yok, sürpriz lisans değişikliği yok.',
  },
  {
    title: 'Self-host',
    text: 'Docker ile tek komutta kur. Verilerin sende kalır.',
  },
  {
    title: 'Herkes katkıda bulunabilir',
    text: '“İyi ilk issue” etiketiyle başla, 48 saat içinde inceleme.',
  },
  {
    title: 'Şeffaf yol haritası',
    text: 'Öncelikler topluluk oyuyla belirlenir.',
  },
];

export default function OpenSource() {
  return (
    <section className="section" id="acik-kaynak" aria-labelledby="acik-kaynak-title">
      <div className="container oss">
        <div>
          <span className="eyebrow">açık kaynak</span>
          <h2 id="acik-kaynak-title">Kod hepimizin.</h2>
          <p>
            SourceMesh bir şirket ürünü değil, topluluk mülkü. İncele, çatalla,
            çalıştır — daha iyisini birlikte inşa edelim.
          </p>

          <ul className="oss-list">
            {POINTS.map((p) => (
              <li key={p.title}>
                <Check aria-hidden="true" />
                <span>
                  <b>{p.title}</b>
                  <small>{p.text}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className="oss-actions">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <Star aria-hidden="true" /> Repoyu Yıldızla
            </a>
            <a href="#acik-kaynak" className="btn btn-secondary">
              Katkı Rehberi
            </a>
          </div>
        </div>

        <div>
          <div className="install" style={{ marginTop: 0 }}>
            <div className="install-head">sourcemesh / sourcemesh</div>
            <div className="codeblock">
              <span className="prompt">$ </span>
              <span className="cmd">gh repo clone sourcemesh/sourcemesh</span>{'\n\n'}
              12.4k yıldız · 1.9k çatallama · 214 açık issue{'\n'}
              v1.2.0 — 6 gün önce yayınlandı
            </div>
          </div>
          <p
            style={{
              marginTop: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: 'var(--faint)',
            }}
          >
            Go · React · PostgreSQL · Docker
          </p>
        </div>
      </div>
    </section>
  );
}
