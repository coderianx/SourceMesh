const STEPS = [
  {
    num: '01',
    title: 'Hesap oluştur',
    text: 'Kullanıcı adı ve şifre yeterli. E-posta doğrulaması istemez.',
  },
  {
    num: '02',
    title: 'Oturum aç',
    text: 'Girişten sonra profil sayfana yönlendirilirsin.',
  },
  {
    num: '03',
    title: 'Meshflow paylaş',
    text: 'İlk paylaşımını oluştur; profilinde listelenmeye başlasın.',
  },
];

const SETUP = [
  'git clone https://github.com/coderianx/SourceMesh',
  'cd SourceMesh/backend && go run .',
  'cd SourceMesh/frontend && npm install && npm run dev',
];

export default function HowItWorks() {
  return (
    <section className="section" id="nasil-calisir" aria-labelledby="nasil-calisir-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">nasıl çalışır</span>
          <h2 id="nasil-calisir-title">Üç adımda başla</h2>
          <p>Kayıt formu yormaz, hesabın hemen hazır olur.</p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <article key={step.num} className="step">
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="install">
          <div className="install-head">yerel kurulum</div>
          <div className="codeblock">
            {SETUP.map((cmd) => (
              <span key={cmd} className="code-line">
                <span className="prompt">$ </span>
                <span className="cmd">{cmd}</span>
              </span>
            ))}
          </div>
          <p className="install-note">
            Backend için PostgreSQL ve Redis gerekir; bağlantı bilgileri .env
            dosyasından okunur.
          </p>
        </div>
      </div>
    </section>
  );
}
