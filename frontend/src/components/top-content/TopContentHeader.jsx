import { useTranslation } from 'react-i18next';
export default function TopContentHeader({ activeDataset, count, onRefresh, onExport, loading }) {
  const { t } = useTranslation();
  const workspace = activeDataset?.name || activeDataset?.label || 'All historical data';
  return (
    <header className="tc-page-header">
      <div>
        <p className="tc-eyebrow">{t('contentDiscovery')}</p>
        <h1>{t('topContent')}<span aria-hidden="true">✨</span></h1>
        <p>Discover what&apos;s getting attention before everyone else.</p>
      </div>
      <div className="tc-header-actions">
        <div className="tc-workspace-control" title={workspace}>
          <span className="tc-live-dot" />
          <div><small>{t('activeWorkspace')}</small><strong>{workspace}</strong></div>
          <span>⌄</span>
        </div>
        <div className="tc-header-count"><strong>{count.toLocaleString()}</strong><span>content items</span></div>
        <button className="tc-header-button" onClick={onRefresh} disabled={loading}>⟳ <span>{loading ? 'Refreshing' : 'Refresh'}</span></button>
        <button className="tc-header-button" onClick={onExport} disabled={!count}>▤ <span>{t('exportPdf')}</span></button>
      </div>
    </header>
  );
}
