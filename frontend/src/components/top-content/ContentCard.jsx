import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlatformIcon from '../PlatformIcon';
import ContentActions from './ContentActions';
import ContentInsight from './ContentInsight';
import ContentMedia from './ContentMedia';
import ContentMetrics from './ContentMetrics';
import { formatPublishedAt, getContentTags } from './contentUtils';

export default function ContentCard({ video, rank, viewMode, onGenerate, onTranscript }) {
  const { t } = useTranslation();
  const tags = getContentTags(video, viewMode === 'list' ? 5 : 3);
  return (
    <article className={`tc-content-card tc-content-card-${viewMode}`}>
      <Link to={`/video/${video.video_id}`} className="tc-card-media-link" aria-label={t('viewTitle', { title: video.title })}>
        <ContentMedia video={video} rank={rank} />
      </Link>
      <div className="tc-card-content">
        <div className="tc-card-heading">
          <div>
            <p className="tc-card-creator"><PlatformIcon platform={video.platform} size={14} /> {video.channel || t('unknownCreator')}</p>
            <Link to={`/video/${video.video_id}`} className="tc-card-title">{video.title || t('untitledContent')}</Link>
          </div>
          <button className="tc-more-button" aria-label="More content actions">•••</button>
        </div>
        <ContentMetrics video={video} compact={viewMode === 'grid'} />
        <div className="tc-card-meta">
          <span>
            {formatPublishedAt(video.published_at).startsWith('date') 
              ? (formatPublishedAt(video.published_at).includes('|') 
                  ? t(formatPublishedAt(video.published_at).split('|')[0], { days: formatPublishedAt(video.published_at).split('|')[1] }) 
                  : t(formatPublishedAt(video.published_at)))
              : formatPublishedAt(video.published_at)}
          </span>
          <span>{video.niche || t('general')}</span>
        </div>
        <div className="tc-tag-row">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        {viewMode === 'list' && <ContentInsight video={video} compact />}
        <ContentActions video={video} onGenerate={onGenerate} onTranscript={onTranscript} />
      </div>
    </article>
  );
}
