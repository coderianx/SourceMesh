import {
  FolderGit2,
  MessagesSquare,
  Newspaper,
  Scale,
  UserRound,
  UsersRound,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MessagesSquare,
    title: 'Topluluklar',
    text: 'İlgi alanına göre topluluk kur, tartış, oyla. Forum disiplini, modern arayüz.',
  },
  {
    icon: Newspaper,
    title: 'Akış',
    text: 'Kısa güncellemeler, kod parçacıkları, tartışmalar. Kronolojik ve reklamsız.',
  },
  {
    icon: UserRound,
    title: 'Profiller',
    text: 'Katkıların ve projelerinle yaşayan bir profil. Özgeçmiş değil, kanıt.',
  },
  {
    icon: FolderGit2,
    title: 'Projeler',
    text: 'Repolarını bağla, sürümlerini duyur, katkıcı bul. Vitrinin hep güncel.',
  },
  {
    icon: UsersRound,
    title: 'Eşleşme',
    text: 'Yetenek ve ilgiye göre ekip arkadaşı, mentor ya da ilk issue’nu bul.',
  },
  {
    icon: Scale,
    title: 'Açık Kaynak',
    text: 'MIT lisansı, self-host desteği. Yol haritası topluluk oyuyla şekillenir.',
  },
];

export default function Features() {
  return (
    <section className="section" id="ozellikler" aria-labelledby="ozellikler-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">özellikler</span>
          <h2 id="ozellikler-title">İhtiyacın olan her şey, tek çatı altında</h2>
          <p>
            Farklı platformlara dağılmana gerek yok. Tartışma, paylaşım ve
            üretim aynı ağda.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <f.icon />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
