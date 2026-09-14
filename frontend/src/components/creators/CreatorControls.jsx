import { useTranslation } from 'react-i18next';
import { CREATOR_TABS } from './creatorUtils';

export default function CreatorControls({
  activeTab, onTabChange, searchTerm, onSearchChange, selectedTrend, onTrendChange, trends,
  sortMode, onSortChange, moreFilters, onToggleMoreFilters, minVideos, onMinVideosChange,
  minEngagement, onMinEngagementChange, onClearFilters,
}) {
  const { t } = useTranslation();
  return (
    <section className="cr-controls" aria-label="Creator filters and views">
      <div className="cr-tabs" role="tablist" aria-label="Creator intelligence views">
        {CREATOR_TABS.map((tab) => (
          <button key={tab.id} role="tab" type="button" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => onTabChange(tab.id)}>{tab.label}</button>
        ))}
      </div>
      <div className="cr-controls-main">
        <label className="cr-search-control">
          <span aria-hidden="true">⌕</span>
          <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search creators or topics…" aria-label="Search creators or topics" />
        </label>
        <select value={selectedTrend} onChange={(event) => onTrendChange(event.target.value)} aria-label="Filter by trend">
          <option value="">{t('allTrends')}</option>
          {trends.map((trend) => <option key={trend} value={trend}>{trend}</option>)}
        </select>
        <select value={sortMode} onChange={(event) => onSortChange(event.target.value)} aria-label="Sort creators">
          <option value="score">{t('aiScore')}</option>
          <option value="engagement">{t('engagement')}</option>
          <option value="dominance">{t('trendDominance')}</option>
          <option value="opportunity">{t('opportunityFit')}</option>
          <option value="growth">{t('growthSignal')}</option>
          <option value="views">{t('views')}</option>
        </select>
        <button className={`cr-filter-toggle ${moreFilters ? 'active' : ''}`} type="button" onClick={onToggleMoreFilters}>☷ Filters</button>
      </div>
      {moreFilters && (
        <div className="cr-advanced-controls">
          <label>{t('minimumContent')}<select value={minVideos} onChange={(event) => onMinVideosChange(Number(event.target.value))}>
              <option value="1">1+ items</option>
              <option value="2">2+ items</option>
              <option value="3">3+ items</option>
              <option value="5">5+ items</option>
            </select>
          </label>
          <label>{t('minimumEngagement')}<select value={minEngagement} onChange={(event) => onMinEngagementChange(Number(event.target.value))}>
              <option value="0">{t('anyRate')}</option>
              <option value="0.02">2%+</option>
              <option value="0.05">5%+</option>
              <option value="0.1">10%+</option>
            </select>
          </label>
          <button type="button" onClick={onClearFilters}>{t('clearFilters')}</button>
        </div>
      )}
    </section>
  );
}
