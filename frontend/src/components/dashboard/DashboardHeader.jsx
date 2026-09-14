import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ refreshing, onRefresh, onOpenPipeline, onSearch }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const username = user?.username || 'Guest Visitor';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) onSearch?.(query.trim());
  };

  return (
    <header className="dash-header">
      <div className="dash-heading-copy">
        <h1>{t('goodMorning')}, {username} <span aria-hidden="true">👋</span></h1>
        <p>{t('whatsTrending')}</p>
      </div>
      <div className="dash-header-tools">
        <form className="dash-search" onSubmit={handleSubmit} role="search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
          />
          <kbd>/</kbd>
        </form>
        <button className="dash-icon-button dash-spark-button" type="button" aria-label="Open Luna intelligence tools">
          ✦
        </button>
        <button className="dash-icon-button dash-notification-button" type="button" aria-label="Notifications">
          ♧
          <i aria-hidden="true" />
        </button>
        <div className="dash-avatar" aria-label={`${username} profile`}>{username.slice(0, 1).toUpperCase()}</div>
      </div>
      <div className="dash-header-actions">
        <button className="dash-action-button" onClick={onRefresh} disabled={refreshing}>
          <span aria-hidden="true">↻</span>
          {refreshing ? t('refreshing') : t('refresh')}
        </button>
        <button className="dash-action-button dash-pipeline-button" onClick={onOpenPipeline}>
          <span aria-hidden="true">🚀</span>{t('pipeline')}</button>
      </div>
    </header>
  );
}
