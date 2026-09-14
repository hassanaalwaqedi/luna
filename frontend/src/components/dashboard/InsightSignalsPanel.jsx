import { useTranslation } from 'react-i18next';
export default function InsightSignalsPanel({ drivers, health, transcriptStats }) {
  const { t } = useTranslation();
  const coverage = Math.min(100, transcriptStats?.coverage_pct || 0);
  return (
    <section className="dash-panel dash-signals-panel">
      <div className="dash-panel-heading"><h2><span aria-hidden="true">🎯</span>{t('insightSignals')}</h2></div>
      <div className="dash-signal-content">
        <div className="dash-signal-block">
          <h3>{t('opportunityDrivers')}</h3>
          <div className="dash-driver-tags">
            {drivers.length > 0 ? drivers.slice(0, 5).map((driver) => <span key={driver}>{driver}</span>) : <span className="dash-muted-note">{t('waitingForMoreSignals')}</span>}
          </div>
        </div>
        <div className="dash-signal-block">
          <h3>{t('systemStatus')}</h3>
          <p className="dash-system-status"><i className={health?.status === 'healthy' ? 'is-healthy' : ''} />{health?.status === 'healthy' ? 'All Systems Operational' : 'System status unavailable'}</p>
        </div>
        <div className="dash-signal-block">
          <h3>{t('transcriptCoverage')}</h3>
          <div className="dash-coverage-line"><span style={{ width: `${coverage}%` }} /><b>{coverage}%</b></div>
          <p className="dash-muted-note">{transcriptStats?.with_transcript || 0} / {transcriptStats?.total_youtube || 0} YouTube videos</p>
        </div>
      </div>
    </section>
  );
}
