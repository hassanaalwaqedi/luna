import { getPlatformIcon, getPlatformLabel, fmt } from '../../utils/platform';

export const EMPTY_THUMBNAIL = '';

export function getContentThumbnail(content = {}) {
  const candidates = [
    content.thumbnail_url,
    content.thumbnailUrl,
    content.thumbnail,
    content.cover_url,
    content.coverUrl,
    content.image_url,
    content.imageUrl,
    content.display_url,
    content.media_url,
  ];

  return candidates.find((value) => {
    const url = String(value || '').trim();
    return url && !['self', 'default', 'nsfw', 'spoiler', 'undefined', 'null'].includes(url.toLowerCase());
  }) || EMPTY_THUMBNAIL;
}

export function getContentStatus(video) {
  const score = Number(video?.score || 0);
  const engagement = Number(video?.engagement_rate || 0);
  if (engagement >= 0.06 && score >= 0.4) return { labelKey: 'badge.trending', tone: 'hot' };
  if (score >= 0.65) return { labelKey: 'badge.highValue', tone: 'high' };
  if (engagement >= 0.035) return { labelKey: 'badge.rising', tone: 'rising' };
  return { labelKey: 'badge.discovered', tone: 'neutral' };
}

export function getContentTags(video, limit = 4) {
  const source = Array.isArray(video?.topics)
    ? video.topics.join(' ')
    : `${video?.topics || ''} ${video?.niche || ''} ${video?.title || ''}`;
  const ignored = new Set(['about', 'their', 'there', 'which', 'these', 'video', 'with', 'from', 'this', 'that', 'your']);
  const tags = source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !ignored.has(word));

  return [...new Set(tags)].slice(0, limit);
}

export function getContentInsight(video) {
  const gap = String(video?.content_gap || '').trim();
  if (gap && gap !== 'Analysis pending') return gap;

  const engagement = Number(video?.engagement_rate || 0);
  if (engagement >= 0.06) return 'insightAudienceResponse';
  if (Number(video?.score || 0) >= 0.6) return 'insightStrongScore';
  return 'insightUsePerformancePattern';
}

export function getContentMetrics(video) {
  return [
    { icon: '▶', labelKey: 'views', value: fmt(video?.views || 0) },
    { icon: '♥', labelKey: 'likes', value: fmt(video?.likes || 0) },
    { icon: '▣', labelKey: 'comments', value: fmt(video?.comments || 0) },
    { icon: '↗', labelKey: 'engagement', value: `${(Number(video?.engagement_rate || 0) * 100).toFixed(1)}%` },
  ];
}

export function formatPublishedAt(value) {
  if (!value) return 'dateRecent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'dateRecent';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return 'dateToday';
  if (days === 1) return 'date1DayAgo';
  if (days < 30) return `dateDaysAgo|${days}`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function platformMeta(platform) {
  return {
    icon: getPlatformIcon(platform),
    label: getPlatformLabel(platform),
  };
}
