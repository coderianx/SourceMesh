import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import { t } from '../lib/i18n.js';

export default function SaveButton({ meshwriteId, saved }) {
  const [isSaved, setIsSaved] = useState(Boolean(saved));
  const [pending, setPending] = useState(false);

  async function toggle() {
    const token = getAccessToken();

    if (!token) {
      window.location.assign('/login');
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/v1/meshwrite/${meshwriteId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearTokens();
        window.location.assign('/login');
        return;
      }

      if (response.ok) {
        setIsSaved((value) => !value);
        return;
      }

      // The server is already in the target state; sync the button with it.
      if (response.status === 409) {
        setIsSaved(true);
      } else if (response.status === 404 && isSaved) {
        setIsSaved(false);
      }
    } catch {
      return;
    } finally {
      setPending(false);
    }
  }

  const label = isSaved ? t('Remove from saved') : t('Save');

  return (
    <button
      type="button"
      className={`save-button${isSaved ? ' saved' : ''}`}
      onClick={toggle}
      disabled={pending}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
    >
      <Bookmark aria-hidden="true" fill={isSaved ? 'currentColor' : 'none'} />
      {t('Save')}
    </button>
  );
}
