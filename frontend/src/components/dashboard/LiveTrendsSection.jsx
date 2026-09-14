import PlatformIcon from '../PlatformIcon';
import { fmt } from '../../utils/platform';

function trendStatus(trend) {
  const engagement = (trend.avg_engagement || 0) * 100;
  if (engagement >= 5) return 'Trending';
  if ((trend.trend_score || 0) >= 0.45) return 'Rising';
  return 'Watching';
}

function getPlatform(videoId = '') {
  if (videoId.startsWith('tiktok_')) return 'tiktok';
  if (videoId.startsWith('reddit_')) return 'reddit';
  if (videoId.startsWith('instagram_')) return 'instagram';
  return 'youtube';
}

function TrendThumbnail({ video, platform }) {
  return (
    <div className={`dash-trend-thumbnail dash-thumb-${platform}`}>
      {video?.thumbnail_url && <img src={video.thumbnail_url} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
      <span aria-hidden="true">{platform === 'youtube' ? '▶' : platform === 'tiktok' ? '♪' : platform === 'reddit' ? '●' : '◎'}</span>
    </div>
  );
}

function LiveTrendCard({ trend, index, onOpen }) {
  const video = trend.top_videos?.[0];
  const platform = getPlatform(video?.video_id);
  const score = Math.max(0, Math.min(1, trend.trend_score || 0));
  return (
    <button className="dash-trend-card" onClick={onOpen} title={`View content for ${trend.trend}`}>
      <div className="dash-trend-visual">
        <TrendThumbnail video={video} platform={platform} />
        <span className="dash-trend-rank">{String(index + 1).padStart(2, '0')}</span>
        <span className="dash-trend-platform"><PlatformIcon platform={platform} size={15} /></span>
        <span className="dash-trend-card-status">↗ {trendStatus(trend)}</span>
      </div>
      <div className="dash-trend-card-copy">
        <strong>{trend.trend}</strong>
        <span>{fmt(trend.total_views || 0)} views · {trend.count || 0} items</span>
      </div>
      <div className="dash-mini-spark" style={{ '--spark-score': score }} aria-hidden="true"><i /></div>
    </button>
  );
}

export default function LiveTrendsSection({ trends, loading, onOpenTrend }) {
  return (
    <section className="dash-panel dash-live-panel">
      <div className="dash-panel-heading">
        <h2><span aria-hidden="true">🔥</span> Trending Right Now</h2>
        <button className="dash-see-all" type="button" onClick={() => onOpenTrend?.('')}>See all <span aria-hidden="true">↗</span></button>
      </div>
      {loading ? (
        <div className="dash-trends-grid dash-trends-skeleton" aria-label="Loading trends">
          {[0, 1, 2, 3, 4].map((item) => <span className="dash-skeleton-card" key={item} />)}
        </div>
      ) : trends.length > 0 ? (
        <div className="dash-trends-grid">
          {trends.slice(0, 5).map((trend, index) => (
            <LiveTrendCard key={`${trend.trend}-${index}`} trend={trend} index={index} onOpen={() => onOpenTrend(trend.trend)} />
          ))}
        </div>
      ) : (
        <div className="dash-empty-inline">
          <span aria-hidden="true">⌕</span>
          <div><strong>No live trends detected</strong><p>Run a new intelligence scan to collect more signals.</p></div>
        </div>
      )}
    </section>
  );
}

export function LiveFeedSection({ trends, opportunities }) {
  const items = [
    ...trends.slice(0, 3).map((trend) => ({ label: 'Trend signal', value: trend.trend, platform: getPlatform(trend.top_videos?.[0]?.video_id) })),
    ...opportunities.slice(0, 2).map((opportunity) => ({ label: 'Opportunity signal', value: opportunity.trend, platform: getPlatform(opportunity.top_videos?.[0]?.video_id) })),
  ];

  return (
    <section className="dash-live-feed" aria-label="Live feed">
      <div className="dash-live-feed-title"><span /> <strong>Live Feed</strong></div>
      <div className="dash-live-feed-items">
        {items.length > 0 ? items.map((item, index) => (
          <div className="dash-live-feed-item" key={`${item.label}-${item.value}-${index}`}>
            <PlatformIcon platform={item.platform} size={17} />
            <div><strong>{item.value}</strong><span>{item.label}</span></div>
          </div>
        )) : <span className="dash-muted-note">Waiting for fresh signals</span>}
      </div>
    </section>
  );
}
