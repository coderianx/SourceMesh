import { Check } from 'lucide-react';
import FlagEN from './FlagEN.jsx';
import FlagTR from './FlagTR.jsx';
import { getLanguage, setLanguage, t } from '../lib/i18n.js';

const LANGUAGES = [
  { code: 'en', name: 'English', Flag: FlagEN },
  { code: 'tr', name: 'Türkçe', Flag: FlagTR },
];

export default function LanguagePicker() {
  const current = getLanguage();

  return (
    <div className="language-picker" role="group" aria-label={t('Language')}>
      <span className="settings-label">{t('Language')}</span>
      {LANGUAGES.map(({ code, name, Flag }) => (
        <button
          key={code}
          type="button"
          role="menuitemradio"
          aria-checked={current === code}
          className={`language-option${current === code ? ' active' : ''}`}
          onClick={() => current !== code && setLanguage(code)}
        >
          <span className="language-flag" aria-hidden="true">
            <Flag />
          </span>
          {name}
          {current === code && <Check className="language-check" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
