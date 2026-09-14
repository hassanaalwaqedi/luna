import { useTranslation } from 'react-i18next';
function FilterPill({ children, active = false }) {
  return <span className={`dash-filter-pill${active ? ' active' : ''}`}>{children}</span>;
}

export default function WorkspaceContextBar({ dataset, totalVideos }) {
  const { t } = useTranslation();
  const regions = dataset?.config_regions || [];
  const keywords = dataset?.config_keywords || [];
  const regionLabel = regions.length > 0 ? regions.join(', ') : 'Worldwide';
  const topicLabel = keywords.length > 0 ? keywords[0] : 'AI Topics';

  return (
    <section className="dash-filter-bar" aria-label="Dashboard filters">
      <div className="dash-filter-pills">
        <FilterPill active><span aria-hidden="true">▦</span>{t('allPlatforms')}</FilterPill>
        <FilterPill><span aria-hidden="true">◎</span>{regionLabel}</FilterPill>
        <FilterPill><span aria-hidden="true">✦</span>{topicLabel}</FilterPill>
        <FilterPill><span aria-hidden="true">◷</span>365d</FilterPill>
      </div>
      <div className="dash-filter-context">
        <span className="dash-status-dot" />
        {dataset?.dataset_label || 'Global workspace'}
        <strong>{totalVideos} content items</strong>
      </div>
    </section>
  );
}
