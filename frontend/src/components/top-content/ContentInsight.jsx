import { useTranslation } from 'react-i18next';
import { getContentInsight } from './contentUtils';

export default function ContentInsight({ video, compact = false }) {
  const { t } = useTranslation();
  const insight = getContentInsight(video);
  return (
    <div className={`tc-content-insight ${compact ? 'tc-content-insight-compact' : ''}`}>
      <span aria-hidden="true">✦</span>
      <div>
        {!compact && <small>{t('aiInsight')}</small>}
        <p>{insight}</p>
      </div>
    </div>
  );
}
