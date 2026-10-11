import { Check, Star } from 'lucide-react';
import { t } from '../lib/i18n.js';

const POINTS = [
  {
    title: t('Source code on GitHub'),
    text: t('The whole core is open; inspect it, fork it, report what you find missing.'),
  },
  {
    title: t('Small and readable'),
    text: t('Few dependencies, a single version and an understandable package structure.'),
  },
  {
    title: t('Open to contributions'),
    text: t('Bug reports and pull requests are welcome.'),
  },
];

export default function OpenSource() {
  return (
    <section className="section" id="acik-kaynak" aria-labelledby="acik-kaynak-title">
      <div className="container oss">
        <div>
          <span className="eyebrow">{t('open source')}</span>
          <h2 id="acik-kaynak-title">{t('The source code is open.')}</h2>
          <p>
            {t(
              'SourceMesh grows with the community. You can inspect the code, run it on your own machine and improve it.',
            )}
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
              {t('Check out the Repo')}
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
