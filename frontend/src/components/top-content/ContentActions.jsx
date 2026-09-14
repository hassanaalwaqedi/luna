import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ContentActions({ video, onGenerate, onTranscript, featured = false }) {
  const { t } = useTranslation();
  return (
    <div className={`tc-content-actions ${featured ? 'tc-content-actions-featured' : ''}`}>
      <Link to={`/video/${video.video_id}`} className="tc-button tc-button-secondary">{t('viewDetails')}</Link>
      <button className="tc-button tc-button-primary" onClick={() => onGenerate(video)}>✦ {t('generateSimilar')}</button>
      {video.platform === 'youtube' && onTranscript && (
        <button className="tc-icon-button" onClick={() => onTranscript(video)} title={t('viewTranscript')} aria-label={t('viewTranscript')}>▤</button>
      )}
    </div>
  );
}
