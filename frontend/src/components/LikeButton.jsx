import { useState } from 'react';
import { Heart } from 'lucide-react';
import { clearTokens, getAccessToken } from '../lib/auth.js';
import { t } from '../lib/i18n.js';

export default function LikeButton({ meshflowId, likes, liked }) {
  const [isLiked, setIsLiked] = useState(Boolean(liked));
  const [count, setCount] = useState(likes || 0);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const token = getAccessToken();

    if (!token) {
      window.location.assign('/login');
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/v1/meshflow/${meshflowId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        clearTokens();
        window.location.assign('/login');
        return;
      }

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        return;
      }

      if (typeof data.likes === 'number') {
        setCount(data.likes);
      }

      setIsLiked(Boolean(data.liked));
    } catch {
      return;
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={`like-button${isLiked ? ' liked' : ''}`}
      onClick={toggle}
      disabled={pending}
      aria-pressed={isLiked}
      aria-label={isLiked ? t('Unlike') : t('Like')}
    >
      <Heart aria-hidden="true" fill={isLiked ? 'currentColor' : 'none'} />
      <span>{count}</span>
    </button>
  );
}
