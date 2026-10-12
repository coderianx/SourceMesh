import { t } from '../lib/i18n.js';

export default function ProfileTabs({ active, onChange }) {
  const tabs = [
    { id: 'posts', label: t('Posts') },
    { id: 'meshwrites', label: 'MeshWrites' },
  ];

  return (
    <div className="profile-tabs" role="tablist" aria-label={t('Profile content')}>
      {tabs.map((tab) => {
        const selected = tab.id === active;

        return (
          <button
            key={tab.id}
            id={`profile-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="profile-panel"
            className={`profile-tab${selected ? ' active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
