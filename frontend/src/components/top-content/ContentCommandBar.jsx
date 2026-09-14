import { useTranslation } from 'react-i18next';
import { ALL_PLATFORMS, getPlatformIcon, getPlatformLabel } from '../../utils/platform';

function FilterChip({ children, onRemove }) {
  return <span className="tc-filter-chip">{children}<button onClick={onRemove} aria-label={`Remove ${children} filter`}>×</button></span>;
}

export default function ContentCommandBar({
  searchTerm, onSearchChange, selectedNiche, onNicheChange, niches, days, onDaysChange,
  platformFilter, onPlatformChange, minScore, onMinScoreChange, viewMode, onViewModeChange,
  sortMode, onSortModeChange, trendFilter, onClearTrend, onReset,
}) {
  const { t } = useTranslation();
  const activeFilters = [
    trendFilter && <FilterChip key="trend" onRemove={onClearTrend}>Trend: {trendFilter}</FilterChip>,
    selectedNiche && <FilterChip key="niche" onRemove={() => onNicheChange('')}>Category: {selectedNiche}</FilterChip>,
    platformFilter && <FilterChip key="platform" onRemove={() => onPlatformChange('')}>{getPlatformLabel(platformFilter)}</FilterChip>,
    minScore > 0 && <FilterChip key="score" onRemove={() => onMinScoreChange(0)}>Score ≥ {minScore.toFixed(2)}</FilterChip>,
    searchTerm && <FilterChip key="search" onRemove={() => onSearchChange('')}>Search: {searchTerm}</FilterChip>,
  ].filter(Boolean);

  return (
    <section className="tc-command-bar" aria-label="Top content controls">
      <div className="tc-command-main">
        <label className="tc-search-field"><span>⌕</span><input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search videos, creators, hashtags, trends..." /></label>
        <select value={selectedNiche} onChange={(event) => onNicheChange(event.target.value)} aria-label="Category">
          <option value="">{t('allCategories')}</option>
          {niches.map((niche) => <option key={niche} value={niche}>{niche}</option>)}
        </select>
        <select value={days} onChange={(event) => onDaysChange(Number(event.target.value))} aria-label="Date range">
          <option value={7}>{t('last7Days')}</option><option value={30}>{t('last30Days')}</option><option value={90}>{t('last90Days')}</option><option value={180}>{t('last180Days')}</option><option value={365}>{t('last365Days')}</option>
        </select>
        <select value={platformFilter} onChange={(event) => onPlatformChange(event.target.value)} aria-label="Platform">
          <option value="">{t('allPlatforms')}</option>
          {ALL_PLATFORMS.map((platform) => <option key={platform} value={platform}>{getPlatformIcon(platform)} {getPlatformLabel(platform)}</option>)}
        </select>
        <label className="tc-score-control"><span>{t('minScore')}<strong>{minScore.toFixed(2)}</strong></span><input type="range" min="0" max="1" step="0.05" value={minScore} onChange={(event) => onMinScoreChange(Number(event.target.value))} /></label>
      </div>
      <div className="tc-command-footer">
        <div className="tc-active-filters">
          <span>{t('activeFilters')}</span>{activeFilters.length ? activeFilters : <em>{t('none')}</em>}
          {activeFilters.length > 0 && <button onClick={onReset}>{t('clearAll')}</button>}
        </div>
        <div className="tc-view-controls">
          <select value={sortMode} onChange={(event) => onSortModeChange(event.target.value)} aria-label="Sort content"><option value="score">{t('sortAiScore')}</option><option value="views">{t('sortViews')}</option><option value="engagement">{t('sortEngagement')}</option><option value="recent">{t('sortMostRecent')}</option></select>
          <div className="tc-view-switch" aria-label="Display mode"><button onClick={() => onViewModeChange('grid')} className={viewMode === 'grid' ? 'active' : ''} aria-label="Grid view">▦ Grid</button><button onClick={() => onViewModeChange('list')} className={viewMode === 'list' ? 'active' : ''} aria-label="List view">☷ List</button></div>
        </div>
      </div>
    </section>
  );
}
