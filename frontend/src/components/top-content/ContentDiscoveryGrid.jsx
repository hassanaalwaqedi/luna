import { useTranslation } from 'react-i18next';
import ContentCard from './ContentCard';

export default function ContentDiscoveryGrid({ videos, viewMode, loading, onGenerate, onTranscript }) {
  const { t } = useTranslation();
  if (loading) {
    return <div className={`tc-discovery-grid tc-discovery-grid-${viewMode}`}>{Array.from({ length: 8 }).map((_, index) => <div className="tc-content-skeleton" key={index} />)}</div>;
  }
  if (!videos.length) {
    return <div className="tc-empty-state"><span>⌕</span><h3>{t('noContentMatchesThisView')}</h3><p>{t('clearAFilterOrUse')}</p></div>;
  }
  return (
    <div className={`tc-discovery-grid tc-discovery-grid-${viewMode}`}>
      {videos.map((video, index) => (
        <ContentCard
          key={video.video_id}
          video={video}
          rank={index + 2}
          viewMode={viewMode}
          onGenerate={onGenerate}
          onTranscript={onTranscript}
        />
      ))}
    </div>
  );
}
