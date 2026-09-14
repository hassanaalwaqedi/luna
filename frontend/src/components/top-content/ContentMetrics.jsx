import { getContentMetrics } from './contentUtils';

import { useTranslation } from 'react-i18next';

export default function ContentMetrics({ video, compact = false }) {
  const { t } = useTranslation();
  const metrics = getContentMetrics(video);
  return (
    <div className={`tc-metrics ${compact ? 'tc-metrics-compact' : ''}`}>
      {metrics.map((metric) => (
        <div className="tc-metric" key={metric.labelKey} title={t(metric.labelKey)}>
          <span>{metric.icon}</span>
          <strong>{metric.value}</strong>
          {!compact && <small>{t(metric.labelKey)}</small>}
        </div>
      ))}
    </div>
  );
}
