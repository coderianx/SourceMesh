import { ArrowRight, MessageSquare, Star } from 'lucide-react';

const PROJECTS = [
  {
    initials: 'EK',
    name: 'mesh-cache',
    repo: 'elifk / mesh-cache',
    lang: 'Rust',
    desc: 'Ekip içi dağıtık derleme önbelleği. CI sürelerini ciddi oranda kısaltıyor, S3 uyumlu depolamayla çalışıyor.',
    tags: '#rust #ci-cd #self-host',
    stars: '2.1k',
    comments: '48',
  },
  {
    initials: 'MA',
    name: 'tr-veri-setleri',
    repo: 'merta / tr-veri-setleri',
    lang: 'Python',
    desc: 'Duygu analizi, özetleme ve soru-cevap için temizlenmiş açık Türkçe veri setleri. Toplulukla büyüyor.',
    tags: '#nlp #türkçe #veri',
    stars: '890',
    comments: '35',
  },
  {
    initials: 'ZD',
    name: 'koyu-palet',
    repo: 'zeynepd / koyu-palet',
    lang: 'TypeScript',
    desc: 'Kontrastı garantileyen koyu tema üretici. Tek tıkla erişilebilir CSS değişkenleri üretiyor.',
    tags: '#tasarım #erişilebilirlik #css',
    stars: '1.4k',
    comments: '62',
  },
];

const TRENDS = [
  { tag: '#rust', count: '4.2k' },
  { tag: '#açık-kaynak', count: '3.8k' },
  { tag: '#yapay-zeka', count: '2.9k' },
  { tag: '#web-geliştirme', count: '2.1k' },
  { tag: '#kariyer', count: '1.4k' },
];

const FILTERS = ['Tümü', 'Rust', 'TypeScript', 'Go', 'Python'];

export default function Showcase() {
  return (
    <section className="section" id="kesfet" aria-labelledby="kesfet-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">keşfet</span>
          <h2 id="kesfet-title">Topluluk ne üretiyor?</h2>
          <p>Vitrine çıkan projeler ve konuşulan etiketler.</p>
        </div>

        <div className="showcase-layout">
          <div>
            <div className="filter-row" role="group" aria-label="Dil filtresi">
              {FILTERS.map((f, i) => (
                <button key={f} type="button" className={i === 0 ? 'active' : ''}>
                  {f}
                </button>
              ))}
            </div>

            {PROJECTS.map((p) => (
              <article key={p.repo} className="project-card">
                <div className="project-top">
                  <span className="avatar" aria-hidden="true">
                    {p.initials}
                  </span>
                  <div>
                    <b>{p.name}</b>
                    <span className="repo">{p.repo}</span>
                  </div>
                  <span className="lang">{p.lang}</span>
                </div>
                <p>{p.desc}</p>
                <p className="project-tags">{p.tags}</p>
                <div className="project-foot">
                  <span>
                    <Star aria-hidden="true" /> {p.stars}
                  </span>
                  <span>
                    <MessageSquare aria-hidden="true" /> {p.comments}
                  </span>
                  <a href="#kesfet">
                    İncele <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <aside className="side-box" aria-label="Gündemdeki etiketler">
            <h3>Gündem</h3>
            <p>Son 7 günde öne çıkanlar</p>
            <ul>
              {TRENDS.map((t) => (
                <li key={t.tag}>
                  <a href="#kesfet">
                    {t.tag} <small>{t.count}</small>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
