import logo from '../assets/logo.svg';

const COLS = [
  {
    title: 'Ürün',
    links: ['Özellikler', 'Keşfet', 'Yol Haritası', 'Değişiklikler'],
  },
  {
    title: 'Topluluk',
    links: ['Blog', 'Etkinlikler', 'Discord', 'X (Twitter)'],
  },
  {
    title: 'Kaynak',
    links: ['GitHub', 'Dokümantasyon', 'Katkı Rehberi', 'MIT Lisansı'],
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="brand" aria-label="SourceMesh ana sayfa">
            <img src={logo} alt="" width="28" height="28" className="brand-logo" />
            SourceMesh
          </a>
          <p>
            Geliştiriciler için tamamen açık kaynaklı sosyal ağ. Topluluk
            tarafından, topluluk için inşa ediliyor.
          </p>
          <p
            style={{
              marginTop: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: 'var(--faint)',
            }}
          >
            mit lisansı · topluluk yönetiminde
          </p>
        </div>

        {COLS.map((c) => (
          <nav key={c.title} className="footer-col" aria-label={c.title}>
            <h4>{c.title}</h4>
            <ul>
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#top">{l}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 SourceMesh · MIT ile açık kaynak</span>
          <span className="right">
            <a href="#top">Gizlilik</a>
            <a href="#top">Kullanım Şartları</a>
            <a href="#top">Türkçe</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
