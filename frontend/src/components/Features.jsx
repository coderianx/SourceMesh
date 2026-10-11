import {
  KeyRound,
  Newspaper,
  ShieldCheck,
  SquareTerminal,
  UserRound,
  Waypoints,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Newspaper,
    title: 'Meshflow akışı',
    text: 'Kısa paylaşımlar oluştur; akışta ve profilinde listelensin, istediğinde sil.',
  },
  {
    icon: UserRound,
    title: 'Profil sayfası',
    text: 'Giriş yaptığında hesap bilgilerin ve meshflow’ların tek sayfada toplanır.',
  },
  {
    icon: KeyRound,
    title: 'JWT oturumları',
    text: 'Kısa ömürlü erişim token’ı ve veritabanında saklanan yenileme token’ı.',
  },
  {
    icon: ShieldCheck,
    title: 'Güvenlik temelleri',
    text: 'Parolalar bcrypt ile hash’lenir; uçlarda IP başına hız sınırı uygulanır.',
  },
  {
    icon: SquareTerminal,
    title: 'REST API',
    text: 'Uygulamanın tamamı, JSON konuşan sade bir HTTP API’siyle çalışır.',
  },
  {
    icon: Waypoints,
    title: 'Az bağımlılık',
    text: 'Go, PostgreSQL, Redis ve React. Bağımlılık listesi kısa tutuldu.',
  },
];

export default function Features() {
  return (
    <section className="section" id="ozellikler" aria-labelledby="ozellikler-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">özellikler</span>
          <h2 id="ozellikler-title">Sade ama işleyen bir çekirdek</h2>
          <p>
            Şu an hesap, paylaşım ve profil var. Gerisi zamanla eklenecek.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <feature.icon />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
