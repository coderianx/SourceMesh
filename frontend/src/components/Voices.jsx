const VOICES = [
  {
    quote:
      'Portfolyomu taşımak için üye oldum, ekip arkadaşlarımı bulmak için kaldım. İki haftada ilk PR’ımı birleştirdim.',
    initials: 'BK',
    name: 'Burak Kılıç',
    role: 'Backend · Ankara',
  },
  {
    quote:
      'Kod bloklu akış büyük fark. Sorumu paylaştım, aynı gün üç çözüm geldi — biri kütüphaneme PR olarak döndü.',
    initials: 'SA',
    name: 'Selin Arslan',
    role: 'Frontend · İzmir',
  },
  {
    quote:
      'Self-host edip şirket içi topluluğumuzu kurduk. Veriler bizde, deneyim sade ve hızlı.',
    initials: 'OA',
    name: 'Onur Aydın',
    role: 'DevOps · İstanbul',
  },
];

export default function Voices() {
  return (
    <section className="section" id="topluluk" aria-labelledby="topluluk-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">topluluk</span>
          <h2 id="topluluk-title">Kullananlar ne diyor?</h2>
          <p>Erken kullanıcıların ilk izlenimleri.</p>
        </div>

        <div className="voices">
          {VOICES.map((v) => (
            <figure key={v.name} className="voice" style={{ margin: 0 }}>
              <blockquote>“{v.quote}”</blockquote>
              <figcaption className="voice-who">
                <span className="avatar" aria-hidden="true">
                  {v.initials}
                </span>
                <span>
                  <b>{v.name}</b>
                  <small>{v.role}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
