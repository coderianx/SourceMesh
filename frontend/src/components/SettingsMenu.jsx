import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import LanguagePicker from './LanguagePicker.jsx';
import { t } from '../lib/i18n.js';

export default function SettingsMenu({ children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="settings-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className="icon-button"
        aria-label={t('Settings')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Settings aria-hidden="true" />
      </button>
      {open && (
        <div className="settings-menu" role="menu">
          {children && <div className="settings-section">{children}</div>}
          <LanguagePicker />
        </div>
      )}
    </div>
  );
}
