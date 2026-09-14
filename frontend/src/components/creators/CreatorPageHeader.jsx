import { useTranslation } from 'react-i18next';
import { relativeUpdatedAt } from './creatorUtils';

export default function CreatorPageHeader({ activeDataset, lastUpdated, onRefresh, onExport, onReset }) {
  const { t } = useTranslation();
  const workspaceName = activeDataset?.dataset_label || (activeDataset ? `Run #${activeDataset.id}` : 'All Historical Data');
  const workspaceMeta = activeDataset?.config?.region || activeDataset?.region || 'Workspace selection';

  return (
    <header className="cr-page-header">
      <div className="cr-heading-copy">
        <p className="cr-eyebrow">{t('creatorIntelligence')}</p>
        <h1><span aria-hidden="true">▰</span>{t('creatorIntelligence')}</h1>
        <p>{t('discoverWhoDominatesTrendsFind')}</p>
      </div>

      <div className="cr-header-actions">
        <div className="cr-workspace-summary" title="Change workspace from the sidebar selector">
          <span className="cr-live-dot" aria-hidden="true" />
          <div>
            <small>{t('activeWorkspace')}</small>
            <strong>{workspaceName}</strong>
          </div>
          <span className="cr-workspace-meta">{workspaceMeta}</span>
        </div>
        <button className="cr-header-button" type="button" onClick={onRefresh}>
          <span aria-hidden="true">⟳</span>{t('refresh')}</button>
        <button className="cr-export-button" type="button" onClick={onExport}>
          <span aria-hidden="true">▣</span>{t('exportPdf')}</button>
        <button className="cr-more-button" type="button" onClick={onReset} title="Reset creator filters" aria-label="Reset creator filters">•••</button>
        <p className="cr-last-updated"><span aria-hidden="true">●</span> {relativeUpdatedAt(lastUpdated)}</p>
      </div>
    </header>
  );
}
