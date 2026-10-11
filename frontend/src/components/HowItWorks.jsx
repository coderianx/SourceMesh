const STEPS = [
  {
    num: '01',
    title: 'Profilini oluştur',
    text: 'GitHub hesabınla giriş yap. Repoların ve katkıların otomatik içe aktarılsın.',
  },
  {
    num: '02',
    title: 'Katıl ve paylaş',
    text: 'İlgini çeken topluluklara katıl, akışta paylaş, tartışmalara dahil ol.',
  },
  {
    num: '03',
    title: 'Birlikte üret',
    text: 'Proje vitrinini doldur, eşleştiğin kişilerle ekip kur, katkıya başla.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="nasil-calisir" aria-labelledby="nasil-calisir-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">nasıl çalışır</span>
          <h2 id="nasil-calisir-title">Üç adımda başla</h2>
          <p>Kayıt formu yorgunluğu yok. Zaten GitHub’dasın — oradan devam et.</p>
        </div>

        <div className="steps">
          {STEPS.map((s) => (
            <article key={s.num} className="step">
              <span className="step-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>

        <div className="install">
          <div className="install-head">kendi sunucunda çalıştır</div>
          <div className="codeblock">
            <span className="prompt">$ </span>
            <span className="cmd">git clone https://github.com/sourcemesh/sourcemesh</span>{'\n'}
            <span className="prompt">$ </span>
            <span className="cmd">cd sourcemesh && docker compose up -d</span>
          </div>
        </div>
      </div>
    </section>
  );
}
