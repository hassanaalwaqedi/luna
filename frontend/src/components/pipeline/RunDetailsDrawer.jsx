import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { formatDuration, formatRelativeTime, getRunDepth, normalizeRunStatus } from './pipelineUtils';

export default function RunDetailsDrawer({ run, onClose, onRerun }) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!run) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [run, onClose]);
  if (!run) return null;
  const status = normalizeRunStatus(run.status);
  const counts = [[t('ingested'), run.videos_ingested], [t('scored'), run.videos_processed], [t('aiAnalyzed'), run.videos_enriched], [t('stored'), run.videos_stored]];
  return <div className="pi-drawer-backdrop" onMouseDown={onClose} role="presentation"><aside className="pi-run-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label={`Scan ${run.id} details`}><button type="button" className="pi-drawer-close" onClick={onClose} aria-label="Close run details">×</button><p>{t('pipelineRun')}</p><div className="pi-drawer-title"><h2>{t('scanHash')}{run.id}</h2><span className={status.tone}>{status.label}</span></div><div className="pi-drawer-meta"><span>Started {formatRelativeTime(run.started_at)}</span><span>{formatDuration(run.elapsed_seconds)}</span><span>{getRunDepth(run)} {t('scan')}</span><span>{run.triggered_by || t('manual')}</span></div><section><h3>{t('pipelineCounts')}</h3><div className="pi-drawer-counts">{counts.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value ?? 0}</strong></div>)}</div></section><section><h3>{t('configuration')}</h3><p className="pi-drawer-muted">{t('historyEndpointDisclaimer')}</p></section>{run.error_message && <section><h3>{t('runMessage')}</h3><p className="pi-drawer-error">{run.error_message}</p></section>}<button type="button" className="pi-drawer-rerun" onClick={() => { onClose(); onRerun(run); }}>↻ {t('rerunCurrentConfig')}</button></aside></div>;
}
